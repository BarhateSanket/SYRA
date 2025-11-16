// MongoDB initialization script
db = db.getSiblingDB('syra_ai');

// Create collections with indexes
db.createCollection('users');
db.users.createIndex({ "email": 1 }, { unique: true });
db.users.createIndex({ "createdAt": 1 });

db.createCollection('analytics');
db.analytics.createIndex({ "userId": 1 });
db.analytics.createIndex({ "timestamp": 1 });

db.createCollection('payments');
db.payments.createIndex({ "userId": 1 });
db.payments.createIndex({ "createdAt": 1 });

db.createCollection('subscriptions');
db.subscriptions.createIndex({ "userId": 1 });
db.subscriptions.createIndex({ "status": 1 });

// Create admin user (for development)
db.users.insertOne({
  name: "Admin User",
  email: "admin@syra.ai",
  password: "$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi", // password
  role: "admin",
  createdAt: new Date(),
  updatedAt: new Date()
});

print("Database initialized successfully");
