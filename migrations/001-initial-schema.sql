-- Up
CREATE TABLE Users (
    id INTEGER PRIMARY KEY,
    email STRING UNIQUE,
    username STRING,
    password STRING
);

CREATE TABLE AuthTokens (
    id INTEGER PRIMARY KEY,
    token STRING,
    userId INTEGER,
    FOREIGN KEY (userId) REFERENCES Users (id)
);

CREATE TABLE Messages (
    id INTEGER PRIMARY KEY,
    authorId INTEGER,
    content STRING,
    FOREIGN KEY (authorId) REFERENCES Users (id)
);

CREATE TABLE Events (
    id INTEGER PRIMARY KEY,
    title STRING,
    eventDescription STRING,
    zoomLink STRING
);

-- Down
DROP TABLE Users;
DROP TABLE AuthTokens;
DROP TABLE Messages;
DROP TABLE Events;
