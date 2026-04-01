async function withTransaction(db, callback) {
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();
    const result = await callback(connection);
    await connection.commit();
    return result;
  } catch (error) {
    try {
      await connection.rollback();
    } catch {
      // Ignore rollback failures and rethrow original error.
    }

    throw error;
  } finally {
    connection.release();
  }
}

module.exports = {
  withTransaction,
};
