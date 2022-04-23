-- Up
CREATE TABLE Users (
    id INTEGER PRIMARY KEY,
    firstName STRING,
    lastName STRING,
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
    title STRING,
    eventDescription STRING,
    zoomLink STRING,
    businessLink STRING,
    startDate STRING,
    startTime STRING,
    endDate STRING,
    endTime STRING
);

CREATE TABLE Messages(
    id INTEGER PRIMARY KEY,
    authorId INTEGER,
    content STRING,
    FOREIGN KEY (authorId) REFERENCES Users (id)
);

-- Down
DROP TABLE Users;
DROP TABLE AuthTokens;
DROP TABLE Events;
DROP TABLE Messages;