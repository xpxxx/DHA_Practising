export type Difficulty = 1 | 2 | 3

export type Domain =
  | 'fundamentals'
  | 'diagnosis'
  | 'treatment'
  | 'safety'
  | 'communication'
  | 'regulation'

export const DOMAIN_LABEL: Record<Domain, string> = {
  fundamentals: '基础与理论',
  diagnosis: '诊断与辨证',
  treatment: '治疗与处方',
  safety: '安全与禁忌',
  communication: '沟通与职业素养',
  regulation: '法规与合规',
}

export type Tag =
  | 'tcm_basics'
  | 'yin_yang'
  | 'zangfu'
  | 'qi_blood_fluids'
  | 'etiology_pathogenesis'
  | 'four_exams'
  | 'pattern_id'
  | 'differential_dx'
  | 'acupuncture'
  | 'herbal'
  | 'tuina'
  | 'diet_lifestyle'
  | 'contraindications'
  | 'red_flags'
  | 'infection_control'
  | 'documentation'
  | 'consent'
  | 'ethics'
  | 'uae_regulation'
  | 'clinic_operations'

export const TAG_LABEL: Record<Tag, string> = {
  tcm_basics: '中医基础',
  yin_yang: '阴阳',
  zangfu: '脏腑',
  qi_blood_fluids: '气血津液',
  etiology_pathogenesis: '病因病机',
  four_exams: '四诊',
  pattern_id: '辨证',
  differential_dx: '鉴别诊断',
  acupuncture: '针灸',
  herbal: '中药',
  tuina: '推拿',
  diet_lifestyle: '饮食与生活方式',
  contraindications: '禁忌与注意事项',
  red_flags: '红旗征象',
  infection_control: '感染控制',
  documentation: '病历与记录',
  consent: '知情同意',
  ethics: '伦理与边界',
  uae_regulation: '阿联酋法规/合规',
  clinic_operations: '门诊流程',
}

export function difficultyLabel(d: Difficulty): string {
  if (d === 1) return '简单'
  if (d === 2) return '中等'
  return '较难'
}
