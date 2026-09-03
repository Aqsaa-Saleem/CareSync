export interface CareVideo {
  id: string;
  title: string;
  category: 'motor' | 'autism' | 'speech' | 'hearing' | 'visual';
  thumbnail: string;
  url: string;
  type: 'video' | 'playlist';
}

export const careVideos: CareVideo[] = [
  // Physical / Motor
  {
    id: 'motor-1',
    title: 'Fine Motor Skills Activities',
    category: 'motor',
    thumbnail: 'https://img.youtube.com/vi/FhotSgLGXJQ/hqdefault.jpg',
    url: 'https://youtu.be/FhotSgLGXJQ?feature=shared',
    type: 'video',
  },
  {
    id: 'motor-2',
    title: 'Motor Development Exercises',
    category: 'motor',
    thumbnail: 'https://img.youtube.com/vi/oIyhHc5341w/hqdefault.jpg',
    url: 'https://youtu.be/oIyhHc5341w?si=ySw8B1-L3wnC2aCZ',
    type: 'video',
  },
  // Autism
  {
    id: 'autism-1',
    title: 'Autism Activities at Home',
    category: 'autism',
    thumbnail: 'https://img.youtube.com/vi/AoNKdyPqt-g/hqdefault.jpg',
    url: 'https://youtu.be/AoNKdyPqt-g?si=aCcQOyQMm6DmyZ3k',
    type: 'video',
  },
  // Speech Delay (same video, different title)
  {
    id: 'speech-1',
    title: 'Activities to Support Communication',
    category: 'speech',
    thumbnail: 'https://img.youtube.com/vi/AoNKdyPqt-g/hqdefault.jpg',
    url: 'https://youtu.be/AoNKdyPqt-g?si=aCcQOyQMm6DmyZ3k',
    type: 'video',
  },
  // Hearing Impairment
  {
    id: 'hearing-1',
    title: 'Sign Language Guide',
    category: 'hearing',
    thumbnail: '',
    url: 'https://youtube.com/playlist?list=PLFjydPMg4DapfRTBMokl09Ht-fhMOAYf6&si=NHow-0uUW-n6ctBg',
    type: 'playlist',
  },
  // Visual Impairment
  {
    id: 'visual-1',
    title: 'Visual Support Activities',
    category: 'visual',
    thumbnail: 'https://img.youtube.com/vi/cflqinn1eCE/hqdefault.jpg',
    url: 'https://youtu.be/cflqinn1eCE?si=7hInskA-eLK2XLxN',
    type: 'video',
  },
  {
    id: 'visual-2',
    title: 'Daily Living Skills for Visual Impairment',
    category: 'visual',
    thumbnail: 'https://img.youtube.com/vi/_xgKpJhaD40/hqdefault.jpg',
    url: 'https://youtu.be/_xgKpJhaD40?si=Qqx_rvxg94h8YPvi',
    type: 'video',
  },
];

export function getVideosByCategory(category: string): CareVideo[] {
  return careVideos.filter((v) => v.category === category);
}
