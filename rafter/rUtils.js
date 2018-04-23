class AuthUtils {
  static handleRafterAppId(existingUser, myId, mySecret, myAppName) {
    for (let i = 0; i < existingUser.rafterApps.length; i += 1) {
      if (existingUser.rafterApps[i].r_app_id === myId) {
        // found = true;
        console.log('I found an app id');
        // if (existingUser.rafterApps[i].r_app_secret !== mySecret) {
          existingUser.rafterApps.splice(i, 1);
          // updateSecret = true;
          // console.log('change the app secret');
          // console.log(mySecret);
          // found = false;
        // }
      }
    }
    // if (!found) {
      existingUser.rafterApps.push({ r_app_id: myId, r_app_secret: mySecret, r_app_name: myAppName });
      return existingUser;
  }
}
module.exports = AuthUtils;
