package id.forgefit.app;

import android.content.ContentValues;
import android.content.Context;
import android.database.Cursor;
import android.database.sqlite.SQLiteDatabase;
import android.database.sqlite.SQLiteOpenHelper;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.Locale;

/** Single persistent app database. All writes are atomic; schema upgrades may never delete user data. */
final class ForgeFitDatabase extends SQLiteOpenHelper {
  static final String DATABASE_NAME="forgefit.db";
  static final int SCHEMA_VERSION=1;
  private static final int MAX_STATE_BYTES=8*1024*1024;

  ForgeFitDatabase(Context ctx) {
    super(ctx.getApplicationContext(),DATABASE_NAME,null,SCHEMA_VERSION);
    setWriteAheadLoggingEnabled(true);
  }
  @Override public void onConfigure(SQLiteDatabase db) {
    super.onConfigure(db);
    db.setForeignKeyConstraintsEnabled(true);
  }
  @Override public void onCreate(SQLiteDatabase db) {
    db.execSQL("CREATE TABLE app_state (id INTEGER PRIMARY KEY CHECK(id=1),"+
      "payload TEXT NOT NULL, checksum TEXT NOT NULL, revision INTEGER NOT NULL, updated_at INTEGER NOT NULL)");
  }
  @Override public void onUpgrade(SQLiteDatabase db,int oldV,int newV) {
    // Future versions must add explicit, additive migrations here.
    // Failure leaves the previous schema and all rows intact.
    throw new IllegalStateException("Migration required: "+oldV+" -> "+newV);
  }
  @Override public void onDowngrade(SQLiteDatabase db,int oldV,int newV) {
    throw new IllegalStateException("Downgrade refused: preserving user records");
  }
  private static void validate(String value) {
    if(value==null || value.isEmpty() || value.getBytes(StandardCharsets.UTF_8).length>MAX_STATE_BYTES)
      throw new IllegalArgumentException("Invalid payload size");
    try {
      JSONObject obj=new JSONObject(value);
      if(obj.has("history") && !(obj.opt("history") instanceof JSONArray))
        throw new IllegalArgumentException("Malformed workout history");
      if(obj.has("routines") && !(obj.opt("routines") instanceof JSONArray))
        throw new IllegalArgumentException("Malformed routines");
    } catch(JSONException e) { throw new IllegalArgumentException("Malformed JSON",e); }
  }
  private static String digest(String payload) {
    try {
      byte[] hash=MessageDigest.getInstance("SHA-256").digest(payload.getBytes(StandardCharsets.UTF_8));
      StringBuilder out=new StringBuilder(hash.length*2);
      for(byte b:hash)out.append(String.format(Locale.ROOT,"%02x",b & 0xff));
      return out.toString();
    } catch(NoSuchAlgorithmException e) {throw new IllegalStateException("SHA-256 unavailable",e);}
  }
  synchronized String loadState() {
    try(Cursor c=getReadableDatabase().rawQuery("SELECT payload,checksum FROM app_state WHERE id=1",null)) {
      if(!c.moveToFirst())return "";
      String value=c.getString(0);
      if(!digest(value).equals(c.getString(1)))throw new IllegalStateException("State checksum mismatch");
      validate(value);
      return value;
    }
  }
  synchronized boolean importLegacyState(String value) {return persist(value,true);}
  synchronized boolean saveState(String value) {return persist(value,false);}
  private boolean persist(String value,boolean onlyIfEmpty) {
    validate(value);
    SQLiteDatabase db=getWritableDatabase();
    db.beginTransaction();
    try {
      long version=0L;
      try(Cursor c=db.rawQuery("SELECT revision FROM app_state WHERE id=1",null)) {
        if(c.moveToFirst()) {
          if(onlyIfEmpty){db.setTransactionSuccessful();return true;}
          version=c.getLong(0);
          if(version==Long.MAX_VALUE)throw new IllegalStateException("Revision limit reached");
        }
      }
      ContentValues row=new ContentValues();
      row.put("id",1);
      row.put("payload",value);
      row.put("checksum",digest(value));
      row.put("revision",version+1);
      row.put("updated_at",System.currentTimeMillis());
      if(db.insertWithOnConflict("app_state",null,row,SQLiteDatabase.CONFLICT_REPLACE)<0)
        throw new IllegalStateException("State was not saved");
      db.setTransactionSuccessful();
      return true;
    } finally {db.endTransaction();}
  }
  synchronized String exportBackup() {
    String value=loadState();
    if(value.isEmpty())throw new IllegalStateException("No data to export");
    try {
      return new JSONObject().put("format","forgefit-backup")
        .put("schemaVersion",SCHEMA_VERSION)
        .put("exportedAt",System.currentTimeMillis())
        .put("data",new JSONObject(value)).toString(2);
    } catch(JSONException e){throw new IllegalStateException("Backup serialization error",e);}
  }
}
