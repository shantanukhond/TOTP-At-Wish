import * as SQLite from 'expo-sqlite';
const STRINGS = require('../../constants/strings');


export const saveToDatabase = async (json_obj:any) => {
    //Writing to db
    const db = SQLite.openDatabaseSync(STRINGS.DB_NAME);

    const insertOrReplaceQuery = `
      INSERT OR REPLACE INTO totp (
        name, logo, secret, created_date, last_modified_date, issuer, user_identifier, algorithm, digits
      )
      VALUES (
        '${json_obj?.account}',
        NULL,
        '${json_obj?.secret}',
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP,
        '${json_obj?.issuer}',
        NULL,
        '${json_obj?.algorithm}',
        ${json_obj?.digits}
      );
    `;

    try {
      await db.execAsync(insertOrReplaceQuery);
      console.log(`Inserted into DB ${json_obj?.account}`)
    
    //  navigation.goBack()
    } catch (ex) {
      console.log(ex)
    }

  }