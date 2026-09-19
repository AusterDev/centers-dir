CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY,
    email TEXT UNIQUE,
    username TEXT NOT NULL,
    authSource TEXT DEFAULT "google",
    permissions INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS centers (
    id INTEGER PRIMARY KEY,
    centerName TEXT NOT NULL,
    centerAddress TEXT NOT NULL,
    areaPin INTEGER NOT NULL,
    averageRating INTEGER DEFAULT 0,
    gMapsLink TEXT NOT NULL,

    originalPosterID INTEGER DEFAULT 0,
    
    FOREIGN KEY (originalPosterID) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS experiences (
    id INTEGER PRIMARY KEY,
    msg TEXT NOT NULL,

    overallRating INTEGER NOT NULL,
    supportiveStaffRating INTEGER DEFAULT 0,
    infraRating INTEGER DEFAULT 0,
    corruptionRating INTEGER DEFAULT 0,
    pcpRating INTEGER DEFAULT 0,
    accessibilityRating INTEGER DEFAULT 0,

    originalPosterID INTEGER DEFAULT 0,
    centerID INTEGER NOT NULL,

    FOREIGN KEY (originalPosterID) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (centerID) REFERENCES centers(id) ON DELETE CASCADE
);

PRAGMA foreign_keys = ON;