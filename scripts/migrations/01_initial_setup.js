/**
 * Initial database setup and migration script
 * 
 * This script creates the required collections with proper indexes and validation rules
 * Run with: node scripts/migrations/01_initial_setup.js
 */

require('dotenv').config({ path: './.env' });
const mongoose = require('mongoose');

// Connect to MongoDB
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

const setupDatabase = async () => {
  const conn = await connectDB();
  const db = conn.connection;

  try {
    // Create user collection with email uniqueness index
    await db.createCollection('users', {
      validator: {
        $jsonSchema: {
          bsonType: 'object',
          required: ['email', 'passwordHash', 'firstName', 'lastName'],
          properties: {
            email: {
              bsonType: 'string',
              description: 'must be a string and is required'
            },
            passwordHash: {
              bsonType: 'string',
              description: 'must be a string and is required'
            },
            firstName: {
              bsonType: 'string',
              description: 'must be a string and is required'
            },
            lastName: {
              bsonType: 'string',
              description: 'must be a string and is required'
            },
            profilePicture: {
              bsonType: 'string',
              description: 'must be a string if provided'
            }
          }
        }
      }
    });
    
    // Create index on email field
    await db.collection('users').createIndex({ email: 1 }, { unique: true });
    console.log('Created users collection with email index');

    // Create press kits collection with slug uniqueness
    await db.createCollection('presskits', {
      validator: {
        $jsonSchema: {
          bsonType: 'object',
          required: ['userId', 'title', 'slug', 'template'],
          properties: {
            userId: {
              bsonType: 'objectId',
              description: 'must be an objectId and is required'
            },
            title: {
              bsonType: 'string',
              description: 'must be a string and is required'
            },
            slug: {
              bsonType: 'string',
              description: 'must be a string and is required'
            },
            template: {
              bsonType: 'string',
              description: 'must be a string and is required'
            },
            isPublished: {
              bsonType: 'bool',
              description: 'must be a boolean if provided'
            }
          }
        }
      }
    });
    
    // Create index on slug field
    await db.collection('presskits').createIndex({ slug: 1 }, { unique: true });
    // Create index on userId field for faster querying
    await db.collection('presskits').createIndex({ userId: 1 });
    console.log('Created presskits collection with slug and userId indexes');

    // Create media collection
    await db.createCollection('media', {
      validator: {
        $jsonSchema: {
          bsonType: 'object',
          required: ['userId', 'pressKitId', 'type', 'title', 'fileUrl'],
          properties: {
            userId: {
              bsonType: 'objectId',
              description: 'must be an objectId and is required'
            },
            pressKitId: {
              bsonType: 'objectId',
              description: 'must be an objectId and is required'
            },
            type: {
              enum: ['audio', 'video', 'image', 'document'],
              description: 'must be one of the specified values and is required'
            },
            title: {
              bsonType: 'string',
              description: 'must be a string and is required'
            },
            fileUrl: {
              bsonType: 'string',
              description: 'must be a string and is required'
            }
          }
        }
      }
    });
    
    // Create index on pressKitId field for faster querying
    await db.collection('media').createIndex({ pressKitId: 1 });
    console.log('Created media collection with pressKitId index');

    // Create analytics collection
    await db.createCollection('analytics', {
      validator: {
        $jsonSchema: {
          bsonType: 'object',
          required: ['pressKitId', 'timestamp'],
          properties: {
            pressKitId: {
              bsonType: 'objectId',
              description: 'must be an objectId and is required'
            },
            timestamp: {
              bsonType: 'date',
              description: 'must be a date and is required'
            }
          }
        }
      }
    });
    
    // Create index on pressKitId field for faster querying
    await db.collection('analytics').createIndex({ pressKitId: 1 });
    // Create index on timestamp field for date-based queries
    await db.collection('analytics').createIndex({ timestamp: 1 });
    console.log('Created analytics collection with pressKitId and timestamp indexes');

    console.log('Database migration completed successfully');
  } catch (error) {
    console.error(`Error during migration: ${error.message}`);
  } finally {
    // Close the connection
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
};

// Run the migration
setupDatabase();
