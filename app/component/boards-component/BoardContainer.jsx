"use client";
import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import { DragDropContext, Draggable, Droppable } from "@hello-pangea/dnd";
import ListColumn from "./ListColumn";
import CommentSidebar from "./CommentSidebar";

const BoardContainer = React.memo(
  ({ lists: initialLists, boardId, onUpdate }) => {
    const [isReady, setIsReady] = useState(false);
    const [isAddingList, setIsAddingList] = useState(false);
    const [listName, setListName] = useState("");
    const [localLists, setLocalLists] = useState(initialLists ?? []);
    const [selectedCard, setSelectedCard] = useState(null);
    const [isCommentSidebarOpen, setIsCommentSidebarOpen] = useState(false);

    // ── Drag-to-scroll refs ────────────────────────────────────
    const scrollRef = useRef(null);
    const isDraggingScroll = useRef(false);
    const startX = useRef(0);
    const scrollLeft = useRef(0);

    useEffect(() => {
      setLocalLists(initialLists ?? []);
    }, [initialLists]);

    useEffect(() => {
      setIsReady(true);
    }, []);

    // ── Cursor anywhere horizontal scroll (no scrollbar) ──────
    useEffect(() => {
      const el = scrollRef.current;
      if (!el) return;

      const onMouseDown = (e) => {
        const target = e.target;
        if (
          target.closest(
            'button, input, textarea, [role="button"], [data-rfd-draggable-id], [data-rfd-droppable-id]',
          )
        ) {
          return;
        }

        isDraggingScroll.current = true;
        startX.current = e.pageX - el.offsetLeft;
        scrollLeft.current = el.scrollLeft;
        el.style.cursor = "grabbing";
        el.style.userSelect = "none";
      };

      const onMouseMove = (e) => {
        if (!isDraggingScroll.current) return;
        e.preventDefault();
        const x = e.pageX - el.offsetLeft;
        const walk = (x - startX.current) * 1.2;
        el.scrollLeft = scrollLeft.current - walk;
      };

      const onMouseUp = () => {
        isDraggingScroll.current = false;
        el.style.cursor = "";
        el.style.userSelect = "";
      };

      el.addEventListener("mousedown", onMouseDown, true);
      window.addEventListener("mousemove", onMouseMove);
      window.addEventListener("mouseup", onMouseUp);

      return () => {
        el.removeEventListener("mousedown", onMouseDown, true);
        window.removeEventListener("mousemove", onMouseMove);
        window.removeEventListener("mouseup", onMouseUp);
      };
    }, [isReady]);

    // ── Optimistic drag end ────────────────────────────────────
    const onDragEnd = useCallback(
      async (result) => {
        const { destination, source, draggableId, type } = result;

        if (!destination) return;
        if (
          destination.droppableId === source.droppableId &&
          destination.index === source.index
        )
          return;

        // Handle LIST drag
        if (type === "LIST") {
          const newLists = [...localLists];
          const [movedList] = newLists.splice(source.index, 1);
          newLists.splice(destination.index, 0, movedList);

          // Update local state immediately for instant responsive 60fps UI
          setLocalLists(newLists);

          try {
            // Bulk update ALL lists in this board with their new order_index
            const reorderedLists = newLists.map((l, idx) => ({
              list_id: l.list_id,
              order_index: idx,
            }));

            const res = await fetch(`/api/boards/${boardId}/lists`, {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ lists: reorderedLists }),
            });

            if (!res.ok) {
              console.error("Failed to update list order");
              onUpdate?.();
            }
          } catch (err) {
            console.error("List drag update failed, reverting", err);
            onUpdate?.();
          }
          return;
        }

        // Handle CARD drag
        const newLists = localLists.map((l) => ({
          ...l,
          cards: l.cards ? [...l.cards] : [],
        }));

        const srcList = newLists.find(
          (l) => `list-${l.list_id}` === source.droppableId,
        );
        const destList = newLists.find(
          (l) => `list-${l.list_id}` === destination.droppableId,
        );

        if (!srcList || !destList) return;
        if (srcList.cards.length === 0 || !srcList.cards[source.index]) return;

        const [movedCard] = srcList.cards.splice(source.index, 1);
        movedCard.list_id = destList.list_id;
        destList.cards.splice(destination.index, 0, movedCard);

        setLocalLists(newLists);

        try {
          const cardId = parseInt(draggableId.replace("card-", ""));
          const destListId = parseInt(
            destination.droppableId.replace("list-", ""),
          );

          // Re-sequence all cards in destList (and srcList if moved across lists)
          const cardsToUpdate = destList.cards.map((c, idx) => ({
            card_id: c.card_id,
            list_id: destListId,
            order_index: idx,
          }));

          if (srcList.list_id !== destList.list_id) {
            srcList.cards.forEach((c, idx) => {
              cardsToUpdate.push({
                card_id: c.card_id,
                list_id: srcList.list_id,
                order_index: idx,
              });
            });
          }

          const res = await fetch("/api/cards", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ cards: cardsToUpdate }),
          });

          if (!res.ok) {
            console.error("Failed to update card order");
            onUpdate?.();
          }
        } catch (err) {
          console.error("Drag update failed, reverting", err);
          onUpdate?.();
        }
      },
      [localLists, boardId, onUpdate],
    );

    const handleAddList = useCallback(async () => {
      if (!listName.trim()) return;
      const res = await fetch(`/api/boards/${boardId}/lists`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: listName }),
      });
      if (res.ok) {
        setListName("");
        setIsAddingList(false);
        onUpdate();
      }
    }, [listName, boardId, onUpdate]);

    const handleKeyDown = useCallback(
      (e) => {
        if (e.key === "Enter") handleAddList();
        if (e.key === "Escape") setIsAddingList(false);
      },
      [handleAddList],
    );

    const handleCardClick = useCallback((card) => {
      setSelectedCard(card);
      setIsCommentSidebarOpen(true);
    }, []);

    const columnCallbacks = useMemo(() => {
      const map = {};
      (initialLists ?? []).forEach((l) => {
        map[l.list_id] = onUpdate;
      });
      return map;
    }, [initialLists, onUpdate]);

    if (!isReady) return null;

    return (
      <div className="flex h-full min-h-0 min-w-0 flex-col">
        <DragDropContext onDragEnd={onDragEnd} nonce="unique-app-nonce">
          <Droppable
            droppableId="lists-container"
            type="LIST"
            direction="horizontal"
          >
            {(provided, snapshot) => (
              <div
                {...provided.droppableProps}
                ref={(el) => {
                  provided.innerRef(el);
                  scrollRef.current = el;
                }}
                className="flex gap-3 h-full items-start overflow-x-auto overflow-y-hidden px-4 py-4 select-none"
                style={{
                  scrollbarWidth: "none",
                  msOverflowStyle: "none",
                  WebkitOverflowScrolling: "touch",
                  background: snapshot.isDraggingOver
                    ? "rgba(99,102,241,0.04)"
                    : "transparent",
                  transition: "background 0.2s ease",
                }}
              >
                <style>{`div::-webkit-scrollbar { display: none; }`}</style>

                {localLists.map((list, i) => (
                  <Draggable
                    key={`list-${list.list_id}`}
                    draggableId={`list-${list.list_id}`}
                    index={i}
                    type="LIST"
                  >
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        style={{
                          ...provided.draggableProps.style,
                          opacity: snapshot.isDragging ? 0.98 : 1,
                          willChange: snapshot.isDragging ? "transform" : "auto",
                        }}
                      >
                        <div
                          {...provided.dragHandleProps}
                          className={
                            snapshot.isDragging
                              ? "cursor-grabbing"
                              : "cursor-grab"
                          }
                        >
                          <ListColumn
                            list={list}
                            onCardAdded={
                              columnCallbacks[list.list_id] ?? onUpdate
                            }
                            onCardClick={handleCardClick}
                            animationDelay={i * 50}
                            isDragging={snapshot.isDragging}
                          />
                        </div>
                      </div>
                    )}
                  </Draggable>
                ))}

                {/* Add List Column Panel */}
                {isAddingList ? (
                  <div className="min-w-72 w-72 shrink-0 rounded-xl p-3 border border-zinc-800 bg-[#16191f] shadow-xl">
                    <input
                      autoFocus
                      className="w-full rounded-lg px-3 py-2 text-xs font-medium text-zinc-100 bg-[#111317] border border-zinc-700/80 outline-none focus:border-indigo-500 placeholder:text-zinc-500"
                      placeholder="Enter column title…"
                      value={listName}
                      onChange={(e) => setListName(e.target.value)}
                      onKeyDown={handleKeyDown}
                    />
                    <div className="flex gap-2 mt-2.5 items-center">
                      <button
                        onClick={handleAddList}
                        className="text-xs font-semibold px-3.5 py-1.5 rounded-lg text-white bg-indigo-600 hover:bg-indigo-500 active:scale-95 transition-all"
                      >
                        Add column
                      </button>
                      <button
                        onClick={() => setIsAddingList(false)}
                        className="text-zinc-400 hover:text-zinc-200 text-xs font-semibold px-2 py-1 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setIsAddingList(true)}
                    className="min-w-72 w-72 shrink-0 flex items-center gap-2 px-4 py-3 rounded-xl text-xs font-semibold text-zinc-400 bg-[#16191f]/60 hover:bg-[#16191f] border border-dashed border-zinc-800 hover:border-zinc-700 active:scale-[0.99] transition-all whitespace-nowrap"
                  >
                    <span className="text-base leading-none text-zinc-300">+</span>
                    Add another column
                  </button>
                )}

                {provided.placeholder}
                <div className="min-w-2 shrink-0" />
              </div>
            )}
          </Droppable>

          {/* Comment Sidebar */}
          <CommentSidebar
            card={selectedCard}
            isOpen={isCommentSidebarOpen}
            onClose={() => setIsCommentSidebarOpen(false)}
          />
        </DragDropContext>
      </div>
    );
  },
);

BoardContainer.displayName = "BoardContainer";
export default BoardContainer;
