CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY,
    email TEXT UNIQUE,
    username TEXT NOT NULL,
    authSource TEXT DEFAULT "google",
    permissions INTEGER DEFAULT 0,

    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    editedAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS centers (
    id INTEGER PRIMARY KEY,

    centerName TEXT NOT NULL,
    centerAddress TEXT NOT NULL,
    areaPin INTEGER NOT NULL,

    aiCode TEXT NOT NULL,
    studyMedium TEXT NOT NULL,
    centerActive BOOLEAN DEFAULT true,
    udiseCode TEXT,
    coursesAvailable TEXT NOT NULL,
    mediums TEXT NOT NULL,
    gender INTEGER NOT NULL,
    mobNumber TEXT NOT NULL,
    emailID TEXT NOT NULL,

    averageRating INTEGER DEFAULT 0,
    averageSupportiveStaffRating INTEGER DEFAULT 0,
    averageInfraRating INTEGER DEFAULT 0,
    averageCorruptionRating INTEGER DEFAULT 0,
    averagePcpRaiting INTEGER DEFAULT 0,
    averageAccessibilityRating INTEGER DEFAULT 0,

    reviewCount INTEGER DEFAULT 0,
    gMapsLink TEXT NOT NULL,
    
    originalPosterID INTEGER DEFAULT 0,
    
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    editedAt DATETIME DEFAULT CURRENT_TIMESTAMP,

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

    isEdited BOOLEAN DEFAULT false,

    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    editedAt DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (originalPosterID) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (centerID) REFERENCES centers(id) ON DELETE CASCADE
);

PRAGMA foreign_keys = ON;