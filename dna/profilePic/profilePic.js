
var MAX_IMAGE_SIZE_BYTES = 5242880; //5MB
var MAX_NAME_LENGTH = 50;
var MAX_TYPE_LENGTH = 20;

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
  // mark any existing pics as deleted
  removeProfilePic()

  var picHash = commit('profilePic', payload);

  // add link to key hash
  commit('profilePicLinks', {
    Links: [{Base: App.Key.Hash, Link: picHash, Tag: 'profilePic'}]
  });

  return picHash;
}


/**
 * Retrieves the profile pic for a given user
 * 
 * @param      {Object} [payload]
 * @param      {string} [payload.agentKeyHash] - (optional) Agent public key hash for which to retrieve an image. Default is to retrieve own image
 */
function getProfilePic(payload) {
  var agentKeyHash = typeof payload.agentKeyHash !== 'undefined' ? payload.agentKeyHash : App.Key.Hash;
  var result = getLinks(agentKeyHash, 'profilePic');

  try {
    return get(result[0].Hash);
  } catch(e) {
    return "NoImageAvailable";
  }
}


/**
 * Marks the calling agents profile pic as deleted
 */
function removeProfilePic() {
  // check if there is an existing entry and remove them if they exist
  getLinks(App.Key.Hash, 'profilePic').forEach(function(link) {
    remove(link.Hash, "Entry Deleted");
  });
  return null;
}


/*=====  End of Public Zome Functions  ======*/

function getFileSizeBytes(data) {
  // In Base64 each char represents 6 bits so the number of bytes is the length * (3/4)
  //exclude the prefix
  var imageData = data.substring(data.indexOf(',')+1, data.length);
  return imageData.length * 3 / 4;
}

function validateProfilePic(profilePicEntry) {
  return (getFileSizeBytes(profilePicEntry.data) <= MAX_IMAGE_SIZE_BYTES) &&
    (profilePicEntry.name.length < MAX_NAME_LENGTH) &&
    (profilePicEntry.type.length < MAX_TYPE_LENGTH);
}

function getCreator (hash) {
  return get(hash, { GetMask: HC.GetMask.Sources })[0];
}

function validate(entry_type, entry, header, pkg, sources) {
  switch(entry_type) {
    case 'profilePic':
      return validateProfilePic(entry);
    case 'profilePicLinks':
      return true;
    default:
      return false;
  }
}

/*============================================
=            Validation Functions            =
============================================*/

function genesis() {
  return true;
}

function validateCommit(entry_type, entry, header, pkg, sources) {
  return validate(entry_type, entry, header, pkg, sources);
}

function validatePut(entry_type, entry, header, pkg, sources) {
  return validate(entry_type, entry, header, pkg, sources);
}

function validateLink(linkEntryType, baseHash, links, pkg, sources) {
  return (linkEntryType === 'profilePicLinks') &&
  // an agent can only modify links on their own key hash
    sources[0] === baseHash;
}

function validateMod(entry_type, entry, header, replaces, pkg, sources) {
  // no modifications
  return false;
}

function validateDel(entry_type, hash, pkg, sources) {
  // no deletions
  return false;
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

