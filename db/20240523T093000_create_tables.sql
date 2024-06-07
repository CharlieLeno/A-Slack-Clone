create table users (
  id INTEGER PRIMARY KEY,
  name VARCHAR(40) UNIQUE,
  password VARCHAR(40),
  api_key VARCHAR(40)
);

create table channels (
    id INTEGER PRIMARY KEY,
    name VARCHAR(40) UNIQUE
);

create table messages (
  id INTEGER PRIMARY KEY,
  user_id INTEGER,
  channel_id INTEGER,
  content TEXT,
  replies_to INTEGER,
  FOREIGN KEY (replies_to) REFERENCES messages(id), 
  FOREIGN KEY(user_id) REFERENCES users(id),
  FOREIGN KEY(channel_id) REFERENCES channels(id)
);


create table reactions (
    id INTEGER PRIMARY KEY,
    emoji TEXT,
    message_id INTEGER,
    user_id INTEGER,
    FOREIGN KEY (message_id) REFERENCES messages(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

create table seen_messages (
    user_id INTEGER NOT NULL,
    channel_id INTEGER NOT NULL,
    last_seen_message_id INTEGER,
    PRIMARY KEY (user_id, channel_id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (channel_id) REFERENCES channels(id),
    FOREIGN KEY (last_seen_message_id) REFERENCES messages(id)
);