import Client from "./Client";
import ClientNote from "./ClientNote";
import Project from "./Project";
import List from "./List";
import Board from "./Board";
import Card from "./Card";
import Comment from "./Comment";
import Description from "./Description";
import User from "./User";
import ChatRoom from "./ChatRoom";
import Message from "./Message";


Client.hasMany(Project, { foreignKey: "client_id" });
Project.belongsTo(Client, { foreignKey: "client_id", onDelete: "CASCADE" });

Board.hasMany(List, {
    foreignKey: "board_id",
    as: "lists",
    onDelete: "CASCADE"
});
List.belongsTo(Board, { foreignKey: "board_id" });

List.hasMany(Card, {
    foreignKey: "list_id",
    as: "cards",
    onDelete: "CASCADE"
});
Card.belongsTo(List, { foreignKey: "list_id" });

Card.hasMany(Comment, {
    foreignKey: "card_id",
    as: "comments",
    onDelete: "CASCADE"
});

Comment.belongsTo(Card, {
    foreignKey: "card_id",
    as: "card"
})

Card.hasMany(Description, {
    foreignKey: "card_id",
    as: "descriptions",
    onDelete: "CASCADE"
})


Description.belongsTo(Card, {
    foreignKey: "card_id",
    as: "card"
})

Client.hasMany(ClientNote, { foreignKey: "client_id", onDelete: "CASCADE" });
ClientNote.belongsTo(Client, { foreignKey: "client_id" });

User.hasMany(ChatRoom, { foreignKey: "created_by" });
ChatRoom.belongsTo(User, { foreignKey: "created_by", as: "creator" });

ChatRoom.hasMany(Message, { foreignKey: "room_id", onDelete: 'CASCADE' });
Message.belongsTo(ChatRoom, { foreignKey: "room_id" });

User.hasMany(Message, { foreignKey: "user_id" });
Message.belongsTo(User, { foreignKey: "user_id", as: "sender" });

export { Client, ClientNote, Project, Board, List, Card, Comment, Description, User, Message, ChatRoom };   