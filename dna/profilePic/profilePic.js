
/*=============================================
=            Public Zome Functions            =
=============================================*/

/**
 * Uploads a profile picture and links it to the agents hash
 *
 * @param      {Object}  payload
 * @param      {string} payload.name - The file name of the image
 * @param      {string} payload.type - The file MIME type
 * @param      {string} payload.data - The imaage in Base64 encoding
 */
function uploadProfilePic(payload) {

  var picHash = commit('profilePic', payload);

  // link it to the agents public key hash
  commit('profilePicLink', {
    Links: [{ Base: App.Key.Hash, Link: picHash, Tag: 'profilePic' }]
  });
}


/**
 * Retrieves the profile pic for a given user
 * 
 * @param      {Object} [payload]
 * @param      {string} [payload.agentKeyHash] - (optional) Agent public key hash for which to retrieve an image. Default is to retrieve own image
 */
function getProfilePic(payload) {
  var agentKeyHash = typeof payload.agentKeyHash !== 'undefined' ? payload.agentKeyHash : App.Key.Hash;
  var result = getLinks(agentKeyHash, 'profilePic', { Load: true });
  if (result.length > 0) {
    return result[0].Entry;
  } else {
    return "NoImageAvailable";
  }
}


/*=====  End of Public Zome Functions  ======*/


/*============================================
=            Validation Functions            =
============================================*/

function genesis() {
  return true;
}

function validateCommit(entry_type, entry, header, pkg, sources) {
  return true;
}

function validatePut(entry_type, entry, header, pkg, sources) {
  return true;
}

function validateLink(linkEntryType, baseHash, links, pkg, sources) {
  return true;
}

function validateMod(entry_type, entry, header, replaces, pkg, sources) {
  return true;
}

function validateDel(entry_type, hash, pkg, sources) {
  return true;
}

function validatePutPkg(entry_type) {
  return null;
}

function validateModPkg(entry_type) {
  return null;
}

function validateDelPkg(entry_type) {
  return null;
}

function validateLinkPkg(entry_type) {
  return null;
}

/*=====  End of Validation Functions  ======*/

