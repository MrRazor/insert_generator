import { fakerCS_CZ as faker } from '@faker-js/faker'
import mysql from 'mysql'
import bcrypt from 'bcrypt'

const connection = mysql.createConnection({
    host: 'localhost',
    port: '3306',
    user: 'root',
    password: 'password',
    database: 'boards-app',
    multipleStatements: true
});

function deleteAllData() {

    connection.query(`
        DELETE FROM Comments;
        DELETE FROM Posts;
        DELETE FROM Authorities;
        DELETE FROM Users;
    `);

    console.log('All rows removed.');
}

function generateTables() {

    connection.query(`
        DROP TABLE IF EXISTS Comments;
        DROP TABLE IF EXISTS Posts;
        DROP TABLE IF EXISTS Authorities;
        DROP TABLE IF EXISTS Users;
        
        CREATE TABLE IF NOT EXISTS Users (
            username VARCHAR(50) PRIMARY KEY,
            password VARCHAR(500) NOT NULL,
            enabled BOOLEAN NOT NULL DEFAULT 1
        );
        
        CREATE TABLE IF NOT EXISTS Authorities (
            username VARCHAR(50) NOT NULL,
            authority VARCHAR(50) NOT NULL,
            PRIMARY KEY (username, authority),
            FOREIGN KEY (username) REFERENCES Users(username)
        );
        
        CREATE TABLE IF NOT EXISTS Posts (
            id BIGINT AUTO_INCREMENT PRIMARY KEY,
            author VARCHAR(50) NOT NULL,
            title VARCHAR(255) NOT NULL,
            content TEXT NOT NULL,
            removed BOOLEAN NOT NULL DEFAULT 0,
            created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (author) REFERENCES Users(username)
        );
        
        CREATE TABLE IF NOT EXISTS Comments (
            id BIGINT AUTO_INCREMENT PRIMARY KEY,
            post_id BIGINT NOT NULL,
            author VARCHAR(50) NOT NULL,
            content TEXT NOT NULL,
            removed BOOLEAN NOT NULL DEFAULT 0,
            created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (author) REFERENCES Users(username),
            FOREIGN KEY (post_id) references Posts(id)
        );
    `)

    console.log("Tables generated.");
}

function generateUsers() {

    const username = 'admin';
    const salt = bcrypt.genSaltSync(10, 'a');
    const hash = bcrypt.hashSync(username, salt);

    connection.query(`INSERT INTO Users (username, password) VALUES (?, ?)`, [username, hash]);
    connection.query(`INSERT INTO Authorities (username, authority) VALUES (?, ?)`, [username, 'ROLE_ADMIN']);

    for (let i = 1; i < 5; i++) {

        const username = `user${i}`;
        const salt = bcrypt.genSaltSync(10, 'a');
        const hash = bcrypt.hashSync(username, salt);

        connection.query(`INSERT INTO Users (username, password) VALUES (?, ?)`, [username, hash]);
        connection.query(`INSERT INTO Authorities (username, authority) VALUES (?, ?)`, [username, 'ROLE_USER']);
    }

    console.log("Users generated.")
}

function generateTestData() {

    for (let i = 0; i < 1_000; i++) {
        const author = `user${Math.floor(Math.random() * 4) + 1}`;
        const title = faker.word.words(3);
        const content = faker.word.words(15);
        //const removed = (Math.random() < 0.05);
        const removed = false;

        //MySQL needs to be set to UTC, otherwise error in 'banned hours' during change from cet to cest (or otherwise)
        const time = faker.date.between(
            {
                    from: new Date(2023, 1, 1),
                    to: new Date(2023,12,31)
                    }
        )

        const updateTime = ((Math.random() < 0.05) || removed) ? faker.date.soon({days: 10, refDate: time}) : time;

        connection.query(
            'INSERT INTO Posts (author, title, content, removed, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)',
            [author, title, content, removed, time, updateTime]
        );
    }

    for (let i = 0; i < 5_000; i++) {
        const post_id = Math.floor(Math.random() * 1_000) + 1;
        const author = `user${Math.floor(Math.random() * 4) + 1}`;
        const content = faker.word.words(5);
        const removed = (Math.random() < 0.05);

        const fromTime = connection.query(`SELECT created_at FROM Posts where id=` + post_id);

        //MySQL needs to be set to UTC, otherwise error in 'banned hours' during change from cet to cest (or otherwise)
        const time = faker.date.soon({days: 10, refDate: fromTime});

        const updateTime = ((Math.random() < 0.05) || removed) ? faker.date.soon({days: 10, refDate: time}) : time;

        connection.query(
            'INSERT INTO Comments (post_id, author, content, removed, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)',
            [post_id, author, content, removed, time, updateTime]
        );
    }

    console.log('Test data created.');
}

connection.connect();

//deleteAllData();
generateTables();
generateUsers();
generateTestData();

connection.end();