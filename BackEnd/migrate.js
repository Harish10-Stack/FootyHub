import mongoose from "mongoose";

// Local MongoDB
const localUri = "mongodb://localhost:27017/footyhub";
// Atlas MongoDB
const atlasUri =
  "mongodb+srv://harishkaladharan10_db_user:Harish%4010@cluster1.plim7mi.mongodb.net/FootyHub?retryWrites=true&w=majority";

// Function to migrate a collection
const migrateCollection = async (collectionName) => {
  // Connect to local
  const localConn = await mongoose.createConnection(localUri);
  const LocalModel = localConn.model(
    collectionName,
    new mongoose.Schema({}, { strict: false }),
    collectionName
  );
  const docs = await LocalModel.find().lean();

  if (docs.length === 0) {
    console.log(`⚠️ No documents found in ${collectionName} locally.`);
    await localConn.close();
    return;
  }

  // Connect to Atlas
  const atlasConn = await mongoose.createConnection(atlasUri);
  const AtlasModel = atlasConn.model(
    collectionName,
    new mongoose.Schema({}, { strict: false }),
    collectionName
  );

  // Optional: clear old Atlas data
  await AtlasModel.deleteMany();

  // Insert into Atlas
  await AtlasModel.insertMany(docs);
  console.log(`✅ Migrated ${docs.length} documents from ${collectionName}`);

  await localConn.close();
  await atlasConn.close();
};

// Run migration
(async () => {
  try {
    await migrateCollection("fixtures");
    await migrateCollection("news");
    console.log("🎉 Migration complete!");
    process.exit(0);
  } catch (err) {
    console.error("❌ Migration failed:", err);
    process.exit(1);
  }
})();
