module.exports = (accountAttributes) => ({
  id: accountAttributes.id,
  displayName: accountAttributes.displayName,
  profilePicture: accountAttributes.profilePicture,
  profilePictureImgix: accountAttributes.profilePictureImgix,
  accountStatus: accountAttributes.status,
  memberSince: accountAttributes.memberSince,
  settings: accountAttributes.settings,
});
