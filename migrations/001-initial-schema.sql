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

CREATE TABLE Events (
    id INTEGER PRIMARY KEY,
    authorId INTEGER,
    title STRING,
    eventDescription STRING,
    zoomLink STRING,
    FOREIGN KEY (authorId) REFERENCES Users (id)
);

-- Down
DROP TABLE Users;
DROP TABLE AuthTokens;
DROP TABLE Events;
