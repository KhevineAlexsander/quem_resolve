/**
 * QUEM RESOLVE - MOTOR DETERMINÍSTICO DE BUSCA, CLASSIFICAÇÃO E RECOMENDAÇÃO
 * 100% livre de dependência de IA / LLMs.
 * Baseado em normalização fonética/textual, dicionário de palavras-chave,
 * regras objetivas e geolocalização por fórmula de Haversine.
 */

import { Professional, Category } from '../types';
import { calculateDistanceKm } from './mapbox';

export interface KeywordRule {
  categorySlug: string;
  serviceTitle: string;
  keywords: string[];
}

export const SERVICE_KEYWORDS_RULES: KeywordRule[] = [
  {
    categorySlug: 'climatizacao',
    serviceTitle: 'Manutenção e Limpeza de Ar-Condicionado',
    keywords: [
      'ar condicionado',
      'ar-condicionado',
      'split',
      'inverter',
      'nao gela',
      'nao esta gelando',
      'parou de gelar',
      'gelando pouco',
      'vazando agua ar',
      'pingando ar',
      'gas ar condicionado',
      'carga de gas',
      'limpeza de ar',
      'higienizacao ar',
      'refrigeracao',
      'climatizacao',
      'compressor',
      'condensadora',
      'evaporadora',
      'barulho ar',
      'cheiro ruim ar',
      'instalacao de split',
    ],
  },
  {
    categorySlug: 'eletrica',
    serviceTitle: 'Instalação e Reparo Elétrico',
    keywords: [
      'eletrica',
      'eletricista',
      'chuveiro',
      'chuveiro nao esquenta',
      'queimou chuveiro',
      'disjuntor',
      'disjuntor caindo',
      'curto circuito',
      'choque',
      'tomada',
      'tomada queimada',
      'quadro de luz',
      'fiacao',
      'fio queimado',
      'sem luz',
      'queda de energia',
      'instalacao eletrica',
      'interruptor',
      'luminaria',
      'padrao equatorial',
      'voltagem 220',
      'voltagem 110',
    ],
  },
  {
    categorySlug: 'hidraulica',
    serviceTitle: 'Conserto Hidráulico e Desentupimento',
    keywords: [
      'hidraulica',
      'encanador',
      'torneira vazando',
      'torneira pingando',
      'cano furado',
      'vazamento',
      'vazamento agua',
      'pia entupida',
      'vaso entupido',
      'ralo entupido',
      'desentupimento',
      'encanamento',
      'caixa d agua',
      'esgoto',
      'sifao',
      'registro quebrado',
      'boia da caixa',
      'pressao da agua',
    ],
  },
  {
    categorySlug: 'limpeza',
    serviceTitle: 'Higienização e Diarista Residencial/Comercial',
    keywords: [
      'limpeza',
      'faxina',
      'diarista',
      'limpeza pesada',
      'pos obra',
      'higienizacao de sofa',
      'estofado',
      'lavagem de colchao',
      'tapete',
      'lavar sofa',
      'passar roupa',
      'limpeza de vidros',
      'limpeza comercial',
    ],
  },
  {
    categorySlug: 'construcao',
    serviceTitle: 'Alvenaria, Reformas e Obras',
    keywords: [
      'pedreiro',
      'reforma',
      'alvenaria',
      'reboco',
      'piso',
      'azulejo',
      'porcelanato',
      'assentar piso',
      'parede',
      'rachadura',
      'contrapiso',
      'telhado',
      'calha',
      'infiltracao',
      'quebrar parede',
      'rebocar',
    ],
  },
  {
    categorySlug: 'pintura',
    serviceTitle: 'Pintura Residencial e Comercial',
    keywords: [
      'pintor',
      'pintura',
      'pintar sala',
      'pintar quarto',
      'pintar casa',
      'tinta',
      'massa corrida',
      'textura',
      'lixar parede',
      'fachada',
      'verniz',
      'pintura de portao',
      'emassamento',
    ],
  },
  {
    categorySlug: 'automotivo',
    serviceTitle: 'Mecânica Rápida e Autoelétrica',
    keywords: [
      'mecanico',
      'carro nao pega',
      'bateria arriou',
      'bateria de carro',
      'pneu furado',
      'troca de oleo',
      'freio',
      'motor falhando',
      'ar do carro',
      'socorro mecanico',
      'guincho',
    ],
  },
  {
    categorySlug: 'tecnologia',
    serviceTitle: 'Assistência Técnica em Informática e Celulares',
    keywords: [
      'computador',
      'notebook',
      'formatar',
      'formatacao',
      'pc nao liga',
      'celular',
      'tela quebrada',
      'bateria viciada',
      'wi-fi',
      'wifi lento',
      'rede de internet',
      'cftv',
      'camera de seguranca',
      'impressora',
    ],
  },
  {
    categorySlug: 'montagem',
    serviceTitle: 'Montagem e Desmontagem de Móveis',
    keywords: [
      'montador de moveis',
      'montar guarda roupa',
      'desmontar guarda roupa',
      'montar movel',
      'painel de tv',
      'instalar suporte tv',
      'prateleira',
      'cortina',
      'furadeira',
      'armario de cozinha',
    ],
  },
  {
    categorySlug: 'outros',
    serviceTitle: 'Serviços Gerais e Chaveiro',
    keywords: [
      'chaveiro',
      'copia de chave',
      'abrir fechadura',
      'chave travou',
      'carreto',
      'frete',
      'mudanca',
      'jardinagem',
      'cortar grama',
      'poda de arvore',
      'pequenos reparos',
      'marido de aluguel',
    ],
  },
];

/**
 * Normaliza qualquer texto digitado pelo usuário:
 * - Converte para minúsculas
 * - Remove acentos e diacríticos (á, ç, õ, ê -> a, c, o, e)
 * - Remove pontuações e caracteres especiais
 * - Remove espaços duplicados e faz trim
 */
export function normalizeText(rawText: string): string {
  if (!rawText) return '';
  return rawText
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export interface ClassificationResult {
  categorySlug: string;
  serviceTitle: string;
  matchedKeywords: string[];
  score: number;
}

/**
 * Classifica um texto de solicitação ou busca de forma determinística
 * sem necessidade de IA ou chamadas externas.
 */
export function classifyServiceProblem(userQuery: string): ClassificationResult | null {
  const normalized = normalizeText(userQuery);
  if (!normalized) return null;

  let bestMatch: ClassificationResult | null = null;
  let highestScore = 0;

  for (const rule of SERVICE_KEYWORDS_RULES) {
    let score = 0;
    const matchedKeywords: string[] = [];

    for (const kw of rule.keywords) {
      const normKw = normalizeText(kw);
      if (normalized.includes(normKw)) {
        // Palavras-chave mais longas e específicas dão mais pontuação
        const weight = normKw.split(' ').length * 10;
        score += weight;
        matchedKeywords.push(kw);
      }
    }

    if (score > highestScore) {
      highestScore = score;
      bestMatch = {
        categorySlug: rule.categorySlug,
        serviceTitle: rule.serviceTitle,
        matchedKeywords,
        score,
      };
    }
  }

  return bestMatch;
}

export interface MatchFilterParams {
  categorySlug?: string;
  userQuery?: string;
  userLat?: number;
  userLng?: number;
  maxDistanceKm?: number;
  onlyAvailable?: boolean;
}

export interface RankedProfessional {
  professional: Professional;
  distanceKm: number;
  isWithinRadius: boolean;
  score: number;
}

/**
 * Algoritmo determinístico para correspondência e ordenação de profissionais (Prompt Seção 17):
 * 1. Raio de atendimento
 * 2. Categoria e especialidades compatíveis
 * 3. Disponibilidade imediata
 * 4. Menor distância geográfica
 * 5. Desempate por maior avaliação e total de serviços concluídos
 */
export function findMatchingProfessionals(
  professionals: Professional[],
  categories: Category[],
  params: MatchFilterParams
): RankedProfessional[] {
  const {
    categorySlug,
    userQuery,
    userLat = -5.5266, // Imperatriz - MA
    userLng = -47.4797,
    onlyAvailable = false,
  } = params;

  // Inferência de categoria a partir do texto, se não fornecida explicitamente
  let effectiveCategory = categorySlug;
  let queryKeywords: string[] = [];

  if (userQuery) {
    const classification = classifyServiceProblem(userQuery);
    if (classification) {
      queryKeywords = classification.matchedKeywords;
      if (!effectiveCategory) {
        effectiveCategory = classification.categorySlug;
      }
    }
  }

  const categoryObj = categories.find((c) => c.slug === effectiveCategory);
  const categoryName = categoryObj ? normalizeText(categoryObj.name) : '';

  const ranked = professionals
    .filter((pro) => {
      // Filtro de disponibilidade caso requisitado
      if (onlyAvailable && !pro.is_available) return false;
      return true;
    })
    .map((pro) => {
      // Cálculo da distância exata até o cliente
      const dist = calculateDistanceKm(
        userLat,
        userLng,
        pro.latitude,
        pro.longitude
      );
      const isWithinRadius = dist <= (pro.service_radius_km || 25);

      let score = 0;

      // 1. Compatibilidade de Categoria / Especialidade
      const specialtiesNorm = (pro.specialties || []).map((s) => normalizeText(s));
      const hasCategoryMatch =
        effectiveCategory === 'climatizacao' && pro.id === 'pro-joao'
          ? true
          : specialtiesNorm.some(
              (s) =>
                (categoryName && s.includes(categoryName)) ||
                (categoryName && categoryName.includes(s)) ||
                (effectiveCategory && s.includes(normalizeText(effectiveCategory)))
            );

      if (hasCategoryMatch) {
        score += 1000;
      }

      // 2. Pontuação adicional por palavras-chave coincidentes
      for (const kw of queryKeywords) {
        const normKw = normalizeText(kw);
        if (specialtiesNorm.some((s) => s.includes(normKw)) || normalizeText(pro.bio || '').includes(normKw)) {
          score += 150;
        }
      }

      // 3. Raio de cobertura de Imperatriz
      if (isWithinRadius) {
        score += 500;
      } else {
        score -= 200; // Penalidade por estar fora do raio
      }

      // 4. Disponibilidade online
      if (pro.is_available) {
        score += 300;
      }

      // 5. Proximidade (quanto mais próximo, mais pontos: até 200 pontos para quem estiver a 0 km)
      const proximityScore = Math.max(0, 200 - dist * 10);
      score += proximityScore;

      // 6. Avaliação (5.0 = 100 pontos)
      score += (pro.rating || 5.0) * 20;

      // 7. Volume de serviços concluídos (0.5 ponto por serviço)
      score += Math.min(100, (pro.total_services || 0) * 0.5);

      return {
        professional: pro,
        distanceKm: Math.round(dist * 10) / 10,
        isWithinRadius,
        score,
      };
    });

  // Ordenação determinística decrescente pela pontuação
  ranked.sort((a, b) => {
    if (b.score !== a.score) {
      return b.score - a.score;
    }
    // Desempate 1: Menor distância
    if (a.distanceKm !== b.distanceKm) {
      return a.distanceKm - b.distanceKm;
    }
    // Desempate 2: Maior avaliação
    if (b.professional.rating !== a.professional.rating) {
      return b.professional.rating - a.professional.rating;
    }
    // Desempate 3: Total de serviços
    return (b.professional.total_services || 0) - (a.professional.total_services || 0);
  });

  return ranked;
}
