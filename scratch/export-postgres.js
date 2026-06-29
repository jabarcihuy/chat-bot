const mariadb = require("mariadb");
const fs = require("fs");
const path = require("path");

const pool = mariadb.createPool({
    host: "127.0.0.1",
    port: 3306,
    user: "root",
    password: "archkontol",
    database: "prd_chat",
    connectionLimit: 5
});

function escapeSql(value) {
    if (value === null || value === undefined) {
        return "NULL";
    }
    if (value instanceof Date) {
        return `'${value.toISOString()}'`;
    }
    if (typeof value === "string") {
        return `'${value.replace(/'/g, "''")}'`;
    }
    if (typeof value === "boolean") {
        return value ? "true" : "false";
    }
    return value;
}

const DDL = `
-- 1. Create Tables matching Prisma Schema
CREATE TABLE IF NOT EXISTS "User" (
    "id" VARCHAR(191) PRIMARY KEY,
    "name" VARCHAR(191),
    "email" VARCHAR(191) UNIQUE,
    "emailVerified" TIMESTAMP(3),
    "image" VARCHAR(191),
    "password" VARCHAR(191)
);

CREATE TABLE IF NOT EXISTS "Account" (
    "id" VARCHAR(191) PRIMARY KEY,
    "userId" VARCHAR(191) NOT NULL,
    "type" VARCHAR(191) NOT NULL,
    "provider" VARCHAR(191) NOT NULL,
    "providerAccountId" VARCHAR(191) NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" VARCHAR(191),
    "scope" VARCHAR(191),
    "id_token" TEXT,
    "session_state" VARCHAR(191),
    CONSTRAINT "Account_provider_providerAccountId_key" UNIQUE ("provider", "providerAccountId"),
    CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "Session" (
    "id" VARCHAR(191) PRIMARY KEY,
    "sessionToken" VARCHAR(191) UNIQUE NOT NULL,
    "userId" VARCHAR(191) NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "VerificationToken" (
    "identifier" VARCHAR(191) NOT NULL,
    "token" VARCHAR(191) UNIQUE NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "VerificationToken_identifier_token_key" UNIQUE ("identifier", "token")
);

CREATE TABLE IF NOT EXISTS "Project" (
    "id" VARCHAR(191) PRIMARY KEY,
    "title" VARCHAR(191) NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" VARCHAR(191) NOT NULL,
    CONSTRAINT "Project_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "Chat" (
    "id" VARCHAR(191) PRIMARY KEY,
    "title" VARCHAR(191) NOT NULL DEFAULT 'Obrolan Baru',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" VARCHAR(191) NOT NULL,
    "projectId" VARCHAR(191),
    "prdDocument" TEXT,
    CONSTRAINT "Chat_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Chat_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "Message" (
    "id" VARCHAR(191) PRIMARY KEY,
    "chatId" VARCHAR(191) NOT NULL,
    "role" VARCHAR(191) NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Message_chatId_fkey" FOREIGN KEY ("chatId") REFERENCES "Chat"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "UserFile" (
    "id" VARCHAR(191) PRIMARY KEY,
    "name" VARCHAR(191) NOT NULL,
    "path" VARCHAR(191) NOT NULL,
    "isDir" BOOLEAN NOT NULL DEFAULT FALSE,
    "content" TEXT,
    "url" VARCHAR(191),
    "size" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" VARCHAR(191) NOT NULL,
    CONSTRAINT "UserFile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "UserFile_userId_path_key" UNIQUE ("userId", "path")
);

-- 2. Create Indexes
CREATE INDEX IF NOT EXISTS "Account_userId_idx" ON "Account"("userId");
CREATE INDEX IF NOT EXISTS "Session_userId_idx" ON "Session"("userId");
CREATE INDEX IF NOT EXISTS "Project_userId_idx" ON "Project"("userId");
CREATE INDEX IF NOT EXISTS "Chat_userId_idx" ON "Chat"("userId");
CREATE INDEX IF NOT EXISTS "Chat_projectId_idx" ON "Chat"("projectId");
CREATE INDEX IF NOT EXISTS "Message_chatId_idx" ON "Message"("chatId");
CREATE INDEX IF NOT EXISTS "UserFile_userId_idx" ON "UserFile"("userId");

`;

async function run() {
    let conn;
    try {
        conn = await pool.getConnection();
        console.log("Connected to local MariaDB successfully.");

        let sqlOutput = `-- Supabase PostgreSQL Data Migration Script\n`;
        sqlOutput += `-- Generated dynamically from local MariaDB database 'prd_chat'\n\n`;
        
        sqlOutput += DDL;
        
        sqlOutput += `BEGIN;\n\n`;

        // 1. Migrate Users
        console.log("Migrating User table...");
        const users = await conn.query("SELECT * FROM User");
        if (users.length > 0) {
            sqlOutput += `-- Table "User"\n`;
            sqlOutput += `INSERT INTO "User" ("id", "name", "email", "emailVerified", "image", "password") VALUES\n`;
            sqlOutput += users.map(u => {
                return `(${escapeSql(u.id)}, ${escapeSql(u.name)}, ${escapeSql(u.email)}, ${escapeSql(u.emailVerified)}, ${escapeSql(u.image)}, ${escapeSql(u.password)})`;
            }).join(",\n") + ";\n\n";
        }

        // 2. Migrate Accounts
        console.log("Migrating Account table...");
        const accounts = await conn.query("SELECT * FROM Account");
        if (accounts.length > 0) {
            sqlOutput += `-- Table "Account"\n`;
            sqlOutput += `INSERT INTO "Account" ("id", "userId", "type", "provider", "providerAccountId", "refresh_token", "access_token", "expires_at", "token_type", "scope", "id_token", "session_state") VALUES\n`;
            sqlOutput += accounts.map(a => {
                return `(${escapeSql(a.id)}, ${escapeSql(a.userId)}, ${escapeSql(a.type)}, ${escapeSql(a.provider)}, ${escapeSql(a.providerAccountId)}, ${escapeSql(a.refresh_token)}, ${escapeSql(a.access_token)}, ${escapeSql(a.expires_at)}, ${escapeSql(a.token_type)}, ${escapeSql(a.scope)}, ${escapeSql(a.id_token)}, ${escapeSql(a.session_state)})`;
            }).join(",\n") + ";\n\n";
        }

        // 3. Migrate Projects
        console.log("Migrating Project table...");
        const projects = await conn.query("SELECT * FROM Project");
        if (projects.length > 0) {
            sqlOutput += `-- Table "Project"\n`;
            sqlOutput += `INSERT INTO "Project" ("id", "title", "description", "createdAt", "updatedAt", "userId") VALUES\n`;
            sqlOutput += projects.map(p => {
                return `(${escapeSql(p.id)}, ${escapeSql(p.title)}, ${escapeSql(p.description)}, ${escapeSql(p.createdAt)}, ${escapeSql(p.updatedAt)}, ${escapeSql(p.userId)})`;
            }).join(",\n") + ";\n\n";
        }

        // 4. Migrate Chats
        console.log("Migrating Chat table...");
        const chats = await conn.query("SELECT * FROM Chat");
        if (chats.length > 0) {
            sqlOutput += `-- Table "Chat"\n`;
            sqlOutput += `INSERT INTO "Chat" ("id", "title", "createdAt", "updatedAt", "userId", "projectId", "prdDocument") VALUES\n`;
            sqlOutput += chats.map(c => {
                return `(${escapeSql(c.id)}, ${escapeSql(c.title)}, ${escapeSql(c.createdAt)}, ${escapeSql(c.updatedAt)}, ${escapeSql(c.userId)}, ${escapeSql(c.projectId)}, ${escapeSql(c.prdDocument)})`;
            }).join(",\n") + ";\n\n";
        }

        // 5. Migrate Messages
        console.log("Migrating Message table...");
        const messages = await conn.query("SELECT * FROM Message");
        if (messages.length > 0) {
            sqlOutput += `-- Table "Message"\n`;
            sqlOutput += `INSERT INTO "Message" ("id", "chatId", "role", "content", "createdAt") VALUES\n`;
            sqlOutput += messages.map(m => {
                return `(${escapeSql(m.id)}, ${escapeSql(m.chatId)}, ${escapeSql(m.role)}, ${escapeSql(m.content)}, ${escapeSql(m.createdAt)})`;
            }).join(",\n") + ";\n\n";
        }

        // 6. Migrate UserFiles (Safely check if table exists in local DB)
        console.log("Migrating UserFile table...");
        try {
            const userFiles = await conn.query("SELECT * FROM UserFile");
            if (userFiles.length > 0) {
                sqlOutput += `-- Table "UserFile"\n`;
                sqlOutput += `INSERT INTO "UserFile" ("id", "name", "path", "isDir", "content", "url", "size", "createdAt", "updatedAt", "userId") VALUES\n`;
                sqlOutput += userFiles.map(uf => {
                    return `(${escapeSql(uf.id)}, ${escapeSql(uf.name)}, ${escapeSql(uf.path)}, ${escapeSql(uf.isDir)}, ${escapeSql(uf.content)}, ${escapeSql(uf.url)}, ${escapeSql(uf.size)}, ${escapeSql(uf.createdAt)}, ${escapeSql(uf.updatedAt)}, ${escapeSql(uf.userId)})`;
                }).join(",\n") + ";\n\n";
            }
        } catch (e) {
            console.log("UserFile table does not exist in local MariaDB. Skipping data migration for UserFile.");
        }

        sqlOutput += `COMMIT;\n`;

        const outputPath = path.join("/home/gaptek/Projects/osrc/chat-bot/supabase_migration.sql");
        fs.writeFileSync(outputPath, sqlOutput, "utf-8");
        console.log(`Successfully generated PostgreSQL migration script with DDL at ${outputPath}`);
    } catch (err) {
        console.error("Migration script failed:", err);
    } finally {
        if (conn) conn.release();
        await pool.end();
    }
}

run();
