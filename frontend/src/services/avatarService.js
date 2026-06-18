/* eslint-disable no-case-declarations */
const AVATAR_APIS = {
  diceBearPersonas: 'https://api.dicebear.com/7.x/personas/svg',
  diceBearAvataaars: 'https://api.dicebear.com/7.x/avataaars/svg',
  diceBearMicah: 'https://api.dicebear.com/7.x/micah/svg',
  diceBearMiniavs: 'https://api.dicebear.com/7.x/miniavs/svg',
  diceBearOpenPeeps: 'https://api.dicebear.com/7.x/open-peeps/svg',
  uiAvatars: 'https://ui-avatars.com/api'
};
const avatarCache = new Map();

export const getCachedAvatar = (username) => {
  if (avatarCache.has(username)) {
    return avatarCache.get(username);
  }

  const avatarUrl = generateAIPersonAvatar(username);
  avatarCache.set(username, avatarUrl);
  return avatarUrl;
};

export const generateAIPersonAvatar = (username) => {
  if (!username) return null;
  const seed = encodeURIComponent(username);
  const params = new URLSearchParams({
    seed,
    backgroundColor: 'b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf',
    backgroundType: 'gradientLinear',
    hairColor: 'auburn,black,blonde,brown,pastelPink,platinum,red,strawberryBlonde',
    skinColor: 'fdbcb4,fd9841,ffd5dc,ffdfbf'
  });
  return `${AVATAR_APIS.diceBearPersonas}?${params.toString()}`;
};


