// Service để generate avatar người AI (cartoon/stylized)
const AVATAR_APIS = {
    // API tạo ảnh người AI 
    diceBearPersonas: 'https://api.dicebear.com/7.x/personas/svg',
    diceBearAvataaars: 'https://api.dicebear.com/7.x/avataaars/svg',
    diceBearMicah: 'https://api.dicebear.com/7.x/micah/svg',
    diceBearMiniavs: 'https://api.dicebear.com/7.x/miniavs/svg',
    diceBearOpenPeeps: 'https://api.dicebear.com/7.x/open-peeps/svg',
  // Fallback UI Avatars
  uiAvatars: 'https://ui-avatars.com/api'
};

// DiceBear Micah
export const generateAvatarUrl = (username) => {
  if (!username) return null;
  const seed = encodeURIComponent(username);
  const params = new URLSearchParams({
    seed: seed,
    backgroundColor: 'b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf',
    backgroundType: 'gradientLinear',
    hairColor: 'auburn,black,blonde,brown,pastelPink,platinum,red,strawberryBlonde',
    skinColor: 'fdbcb4,fd9841,ffd5dc,ffdfbf',
    eyeColor: 'blue,green,brown,hazel',
    mouthType: 'smile,smirk,serious,concerned',
    eyebrowType: 'raised,default,angry,concerned',
    accessoriesType: 'prescription01,prescription02,round,wayfarers',
    clothingType: 'blazerAndShirt,blazerAndSweater,collarAndSweater,graphicShirt,hoodie,overall,shirtCrewNeck,shirtScoopNeck,shirtVNeck',
    clothingColor: 'black,blue01,blue02,blue03,gray01,gray02,heather,pastelBlue,pastelGreen,pastelOrange,pastelRed,pastelYellow,pink,red,white'
  });
  
  return `${AVATAR_APIS.diceBearPersonas}?${params.toString()}`;
};

export const generateAvatarWithStyle = (username, style = 'personas') => {
  if (!username) return null;
  
  const seed = encodeURIComponent(username);
  
  switch (style) {
    case 'personas':
      const personasParams = new URLSearchParams({
        seed: seed,
        backgroundColor: 'b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf',
        backgroundType: 'gradientLinear',
        hairColor: 'auburn,black,blonde,brown,pastelPink,platinum,red,strawberryBlonde',
        skinColor: 'fdbcb4,fd9841,ffd5dc,ffdfbf',
        eyeColor: 'blue,green,brown,hazel',
        mouthType: 'smile,smirk,serious,concerned',
        eyebrowType: 'raised,default,angry,concerned',
        accessoriesType: 'prescription01,prescription02,round,wayfarers',
        clothingType: 'blazerAndShirt,blazerAndSweater,collarAndSweater,graphicShirt,hoodie,overall,shirtCrewNeck,shirtScoopNeck,shirtVNeck',
        clothingColor: 'black,blue01,blue02,blue03,gray01,gray02,heather,pastelBlue,pastelGreen,pastelOrange,pastelRed,pastelYellow,pink,red,white'
      });
      return `${AVATAR_APIS.diceBearPersonas}?${personasParams.toString()}`;
      
    case 'avataaars':
      const avataaarsParams = new URLSearchParams({
        seed: seed,
        backgroundColor: 'b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf',
        backgroundType: 'gradientLinear',
        hairColor: 'auburn,black,blonde,brown,pastelPink,platinum,red,strawberryBlonde',
        skinColor: 'fdbcb4,fd9841,ffd5dc,ffdfbf',
        eyeColor: 'blue,green,brown,hazel',
        mouthType: 'smile,smirk,serious,concerned',
        eyebrowType: 'raised,default,angry,concerned',
        accessoriesType: 'prescription01,prescription02,round,wayfarers',
        clothingType: 'blazerAndShirt,blazerAndSweater,collarAndSweater,graphicShirt,hoodie,overall,shirtCrewNeck,shirtScoopNeck,shirtVNeck',
        clothingColor: 'black,blue01,blue02,blue03,gray01,gray02,heather,pastelBlue,pastelGreen,pastelOrange,pastelRed,pastelYellow,pink,red,white'
      });
      return `${AVATAR_APIS.diceBearAvataaars}?${avataaarsParams.toString()}`;
      
    case 'micah':
      
      const micahParams = new URLSearchParams({
        seed: seed,
        backgroundColor: 'b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf',
        backgroundType: 'gradientLinear'
      });
      return `${AVATAR_APIS.diceBearMicah}?${micahParams.toString()}`;
      
    case 'miniavs':
      const miniavsParams = new URLSearchParams({
        seed: seed,
        backgroundColor: 'b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf',
        backgroundType: 'gradientLinear'
      });
      return `${AVATAR_APIS.diceBearMiniavs}?${miniavsParams.toString()}`;
      
    case 'openpeeps':
      const openpeepsParams = new URLSearchParams({
        seed: seed,
        backgroundColor: 'b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf',
        backgroundType: 'gradientLinear'
      });
      return `${AVATAR_APIS.diceBearOpenPeeps}?${openpeepsParams.toString()}`;
      
    case 'ui-avatar':
      const params = new URLSearchParams({
        name: username,
        size: '200',
        background: 'random',
        color: 'fff',
        format: 'png',
        bold: 'true'
      });
      return `${AVATAR_APIS.uiAvatars}?${params.toString()}`;
      
    default:
      return generateAvatarUrl(username);
  }
};

export const AVATAR_STYLES = {
  personas: 'Personas (Ảnh người AI đẹp nhất)',
  avataaars: 'Avataaars (Ảnh người AI chi tiết)',
  micah: 'Micah (Ảnh người AI đơn giản)',
  miniavs: 'Miniavs (Ảnh người AI nhỏ gọn)',
  openpeeps: 'Open Peeps (Ảnh người AI thân thiện)',
  'ui-avatar': 'Avatar với tên',
  pixelArt: 'Pixel Art',
  bottts: 'Bottts',
  identicon: 'Identicon',
  initials: 'Initials'
};

export const generateAvatarOptions = (username) => {
  if (!username) return [];
  
  return Object.keys(AVATAR_STYLES).map(style => ({
    style,
    name: AVATAR_STYLES[style],
    url: generateAvatarWithStyle(username, style)
  }));
};

export const getFallbackAvatar = (username) => {
  if (!username) return null;
  return generateAvatarWithStyle(username, 'personas');
};

const avatarCache = new Map();

export const getCachedAvatar = (username) => {
  if (avatarCache.has(username)) {
    return avatarCache.get(username);
  }
  
  const avatarUrl = generateAvatarWithStyle(username, 'personas');
  avatarCache.set(username, avatarUrl);
  return avatarUrl;
};

export const generateAIPersonAvatar = (username) => {
  if (!username) return null;
  
  return generateAvatarWithStyle(username, 'personas');
};

export const generateNameBasedAvatar = (username) => {
  if (!username) return null;
  
  const params = new URLSearchParams({
    name: username,
    size: '200',
    background: 'random',
    color: 'fff',
    format: 'png',
    bold: 'true',
    font_size: '0.5'
  });
  
  return `${AVATAR_APIS.uiAvatars}?${params.toString()}`;
};

export const clearAvatarCache = () => {
  avatarCache.clear();
};
