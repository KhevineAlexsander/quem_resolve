import { ServiceTrackingStatus, ServiceRequestStatus } from '../types';

export interface StatusMeta {
  status: ServiceTrackingStatus;
  title: string;
  badgeLabel: string;
  clientDescription: string;
  professionalDescription: string;
  notificationTitle: string;
  notificationMessage: (proName?: string) => string;
  iconName: string;
  colorClass: string;
  stepIndex: number;
}

export const STATUS_SEQUENCE: ServiceTrackingStatus[] = [
  'REQUESTED',
  'PROFESSIONALS_NOTIFIED',
  'QUOTE_RECEIVED',
  'PROFESSIONAL_SELECTED',
  'SCHEDULED',
  'ON_THE_WAY',
  'ARRIVED',
  'IN_PROGRESS',
  'COMPLETED',
];

export const STATUS_DEFINITIONS: Record<ServiceTrackingStatus, StatusMeta> = {
  REQUESTED: {
    status: 'REQUESTED',
    title: 'Solicitação criada',
    badgeLabel: 'Solicitação Criada',
    clientDescription: 'Sua solicitação foi registrada e está pronta para análise dos profissionais.',
    professionalDescription: 'Nova solicitação de serviço disponível para atendimento.',
    notificationTitle: '📋 Solicitação criada',
    notificationMessage: () => 'Sua solicitação foi criada com sucesso.',
    iconName: 'FileText',
    colorClass: 'text-blue-400 bg-blue-500/10 border-blue-500/30',
    stepIndex: 0,
  },
  PROFESSIONALS_NOTIFIED: {
    status: 'PROFESSIONALS_NOTIFIED',
    title: 'Profissionais notificados',
    badgeLabel: 'Profissionais Notificados',
    clientDescription: 'Profissionais qualificados da região de Imperatriz foram avisados.',
    professionalDescription: 'Você foi notificado sobre uma nova solicitação compatível.',
    notificationTitle: '🔔 Profissionais notificados',
    notificationMessage: () => 'Profissionais qualificados na sua região foram notificados.',
    iconName: 'Users',
    colorClass: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30',
    stepIndex: 1,
  },
  QUOTE_RECEIVED: {
    status: 'QUOTE_RECEIVED',
    title: 'Novo orçamento recebido',
    badgeLabel: 'Orçamento Recebido',
    clientDescription: 'Um profissional enviou proposta com valor e horários disponíveis.',
    professionalDescription: 'Seu orçamento foi enviado ao cliente.',
    notificationTitle: '💰 Novo orçamento recebido',
    notificationMessage: (proName) => `${proName || 'Um profissional'} enviou um orçamento para sua solicitação.`,
    iconName: 'DollarSign',
    colorClass: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
    stepIndex: 2,
  },
  PROFESSIONAL_SELECTED: {
    status: 'PROFESSIONAL_SELECTED',
    title: 'Profissional selecionado',
    badgeLabel: 'Profissional Escolhido',
    clientDescription: 'Você escolheu o profissional para a realização do serviço.',
    professionalDescription: 'Parabéns! O cliente escolheu o seu orçamento.',
    notificationTitle: '🤝 Profissional selecionado',
    notificationMessage: (proName) => `Você selecionou ${proName || 'o profissional'} para o serviço.`,
    iconName: 'UserCheck',
    colorClass: 'text-orange-400 bg-orange-500/10 border-orange-500/30',
    stepIndex: 3,
  },
  SCHEDULED: {
    status: 'SCHEDULED',
    title: 'Serviço agendado',
    badgeLabel: 'Serviço Agendado',
    clientDescription: 'Data e horário do atendimento confirmados.',
    professionalDescription: 'Atendimento confirmado em sua agenda.',
    notificationTitle: '📅 Serviço agendado',
    notificationMessage: () => 'Seu serviço foi agendado e confirmado.',
    iconName: 'CalendarCheck',
    colorClass: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30',
    stepIndex: 4,
  },
  ON_THE_WAY: {
    status: 'ON_THE_WAY',
    title: 'Profissional a caminho',
    badgeLabel: 'A Caminho',
    clientDescription: 'O profissional já iniciou o deslocamento até o seu endereço.',
    professionalDescription: 'Você informou que está a caminho do local do cliente.',
    notificationTitle: '🚗 Profissional a caminho',
    notificationMessage: (proName) => `${proName || 'O profissional'} informou que está a caminho para realizar seu serviço.`,
    iconName: 'Truck',
    colorClass: 'text-orange-400 bg-orange-500/20 border-orange-500/50',
    stepIndex: 5,
  },
  ARRIVED: {
    status: 'ARRIVED',
    title: 'Profissional chegou ao local',
    badgeLabel: 'No Local',
    clientDescription: 'O profissional chegou ao endereço e está pronto para o atendimento.',
    professionalDescription: 'Você confirmou a chegada ao endereço do cliente.',
    notificationTitle: '📍 Profissional chegou',
    notificationMessage: (proName) => `${proName || 'O profissional'} informou que chegou ao local.`,
    iconName: 'MapPin',
    colorClass: 'text-emerald-400 bg-emerald-500/20 border-emerald-500/50',
    stepIndex: 6,
  },
  IN_PROGRESS: {
    status: 'IN_PROGRESS',
    title: 'Serviço em andamento',
    badgeLabel: 'Em Andamento',
    clientDescription: 'O profissional iniciou a execução do serviço.',
    professionalDescription: 'Serviço em execução.',
    notificationTitle: '🔧 Serviço iniciado',
    notificationMessage: () => 'O profissional iniciou o atendimento.',
    iconName: 'Wrench',
    colorClass: 'text-blue-400 bg-blue-500/20 border-blue-500/50',
    stepIndex: 7,
  },
  COMPLETED: {
    status: 'COMPLETED',
    title: 'Serviço concluído',
    badgeLabel: 'Concluído',
    clientDescription: 'Serviço finalizado com sucesso. Faça sua avaliação!',
    professionalDescription: 'Serviço finalizado com sucesso.',
    notificationTitle: '✅ Serviço concluído',
    notificationMessage: () => 'O serviço foi concluído. Avalie seu atendimento.',
    iconName: 'CheckCircle2',
    colorClass: 'text-emerald-400 bg-emerald-500/20 border-emerald-500/50',
    stepIndex: 8,
  },
  CANCELLED: {
    status: 'CANCELLED',
    title: 'Serviço cancelado',
    badgeLabel: 'Cancelado',
    clientDescription: 'Esta solicitação foi cancelada.',
    professionalDescription: 'Esta solicitação foi cancelada.',
    notificationTitle: '⚠️ Serviço cancelado',
    notificationMessage: () => 'A solicitação de serviço foi cancelada.',
    iconName: 'XCircle',
    colorClass: 'text-rose-400 bg-rose-500/10 border-rose-500/30',
    stepIndex: -1,
  },
};

// Converte status legado para o novo formato padronizado
export function normalizeStatus(status: ServiceRequestStatus | string | undefined): ServiceTrackingStatus {
  if (!status) return 'REQUESTED';
  const upper = status.toUpperCase();

  if (upper === 'REQUESTED' || upper === 'PENDING') return 'REQUESTED';
  if (upper === 'PROFESSIONALS_NOTIFIED' || upper === 'SEARCHING') return 'PROFESSIONALS_NOTIFIED';
  if (upper === 'QUOTE_RECEIVED' || upper === 'QUOTES_RECEIVED') return 'QUOTE_RECEIVED';
  if (upper === 'PROFESSIONAL_SELECTED' || upper === 'ACCEPTED') return 'PROFESSIONAL_SELECTED';
  if (upper === 'SCHEDULED') return 'SCHEDULED';
  if (upper === 'ON_THE_WAY' || upper === 'PROFESSIONAL_ON_WAY') return 'ON_THE_WAY';
  if (upper === 'ARRIVED') return 'ARRIVED';
  if (upper === 'IN_PROGRESS') return 'IN_PROGRESS';
  if (upper === 'COMPLETED') return 'COMPLETED';
  if (upper === 'CANCELLED') return 'CANCELLED';

  return 'REQUESTED';
}

// Retorna metadados do status
export function getStatusMeta(status: ServiceRequestStatus | string | undefined): StatusMeta {
  const norm = normalizeStatus(status);
  return STATUS_DEFINITIONS[norm] || STATUS_DEFINITIONS.REQUESTED;
}

// Validação rígida de transição de status para impedir pulo de etapas indevido
export function canTransitionStatus(
  current: ServiceTrackingStatus,
  target: ServiceTrackingStatus,
  isProfessional: boolean = false
): { allowed: boolean; reason?: string } {
  if (current === target) {
    return { allowed: true };
  }

  // Cancelamento permitido exceto se já finalizado
  if (target === 'CANCELLED') {
    if (current === 'COMPLETED') {
      return { allowed: false, reason: 'Não é possível cancelar um serviço já concluído.' };
    }
    return { allowed: true };
  }

  if (current === 'COMPLETED') {
    return { allowed: false, reason: 'O serviço já foi concluído e não pode retroceder.' };
  }

  if (current === 'CANCELLED') {
    return { allowed: false, reason: 'O serviço está cancelado.' };
  }

  // Sequência padrão permitida para o profissional
  const allowedNext: Record<ServiceTrackingStatus, ServiceTrackingStatus[]> = {
    REQUESTED: ['PROFESSIONALS_NOTIFIED', 'QUOTE_RECEIVED', 'CANCELLED'],
    PROFESSIONALS_NOTIFIED: ['QUOTE_RECEIVED', 'PROFESSIONAL_SELECTED', 'CANCELLED'],
    QUOTE_RECEIVED: ['PROFESSIONAL_SELECTED', 'CANCELLED'],
    PROFESSIONAL_SELECTED: ['SCHEDULED', 'ON_THE_WAY', 'CANCELLED'],
    SCHEDULED: ['ON_THE_WAY', 'CANCELLED'],
    ON_THE_WAY: ['ARRIVED', 'CANCELLED'],
    ARRIVED: ['IN_PROGRESS', 'CANCELLED'],
    IN_PROGRESS: ['COMPLETED', 'CANCELLED'],
    COMPLETED: [],
    CANCELLED: [],
  };

  const nextValidList = allowedNext[current] || [];
  if (nextValidList.includes(target)) {
    return { allowed: true };
  }

  return {
    allowed: false,
    reason: `Transição inválida de "${STATUS_DEFINITIONS[current]?.title}" para "${STATUS_DEFINITIONS[target]?.title}". Siga o fluxo em sequência.`,
  };
}

// Retorna a próxima ação disponível para o profissional
export function getProfessionalNextAction(status: ServiceTrackingStatus): {
  nextStatus: ServiceTrackingStatus | null;
  buttonLabel: string;
  iconName: string;
  buttonColorClass: string;
} | null {
  switch (status) {
    case 'PROFESSIONAL_SELECTED':
    case 'SCHEDULED':
      return {
        nextStatus: 'ON_THE_WAY',
        buttonLabel: 'Estou a caminho',
        iconName: 'Truck',
        buttonColorClass: 'bg-orange-500 hover:bg-orange-600 text-slate-950 font-bold',
      };
    case 'ON_THE_WAY':
      return {
        nextStatus: 'ARRIVED',
        buttonLabel: 'Cheguei ao local',
        iconName: 'MapPin',
        buttonColorClass: 'bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold',
      };
    case 'ARRIVED':
      return {
        nextStatus: 'IN_PROGRESS',
        buttonLabel: 'Iniciar serviço',
        iconName: 'Play',
        buttonColorClass: 'bg-blue-500 hover:bg-blue-600 text-white font-bold',
      };
    case 'IN_PROGRESS':
      return {
        nextStatus: 'COMPLETED',
        buttonLabel: 'Concluir serviço',
        iconName: 'CheckCircle2',
        buttonColorClass: 'bg-emerald-600 hover:bg-emerald-700 text-white font-bold',
      };
    default:
      return null;
  }
}
