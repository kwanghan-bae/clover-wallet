import React from 'react';
import { 
  Moon, 
  Calendar, 
  TrendingUp, 
  TrendingDown, 
  Star, 
  Heart, 
  Leaf, 
  BookOpen, 
  Palette, 
  PawPrint 
} from 'lucide-react-native';

/** 
 * @description 로또 번호 생성을 위해 제공되는 다양한 분석 방법론 목록입니다. 
 */
export const METHODS = [
  { id: 'DREAM', title: '꿈 해몽', subtitle: '밤에 꾼 꿈을 분석해요', color: '#7E57C2', icon: <Moon size={28} color="white" /> },
  { id: 'SAJU', title: '사주팔자', subtitle: '생년월일로 행운의 숫자를', color: '#D84315', icon: <Calendar size={28} color="white" /> },
  { id: 'STATISTICS_HOT', title: '통계 (HOT)', subtitle: '자주 나온 번호', color: '#EF5350', icon: <TrendingUp size={28} color="white" /> },
  { id: 'STATISTICS_COLD', title: '통계 (COLD)', subtitle: '안 나온 번호', color: '#42A5F5', icon: <TrendingDown size={28} color="white" /> },
  { id: 'HOROSCOPE', title: '별자리 운세', subtitle: '오늘의 별자리 행운', color: '#FFA726', icon: <Star size={28} color="white" /> },
  { id: 'PERSONAL_SIGNIFICANCE', title: '의미있는 숫자', subtitle: '기념일, 생일 등 특별한 날', color: '#EC407A', icon: <Heart size={28} color="white" /> },
  { id: 'NATURE_PATTERNS', title: '자연의 패턴', subtitle: '피보나치, 계절의 리듬', color: '#66BB6A', icon: <Leaf size={28} color="white" /> },
  { id: 'ANCIENT_DIVINATION', title: '고대 점술', subtitle: '주역, 룬 등의 신비', color: '#8D6E63', icon: <BookOpen size={28} color="white" /> },
  { id: 'COLORS_SOUNDS', title: '색상 & 소리', subtitle: '색상 심리와 음악 주파수', color: '#26C6DA', icon: <Palette size={28} color="white" /> },
  { id: 'ANIMAL_OMENS', title: '동물 징조', subtitle: '동물의 신비로운 힘', color: '#AB47BC', icon: <PawPrint size={28} color="white" /> },
];
