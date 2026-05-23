export type FeaturePriority = "must" | "should" | "could";

export interface FeatureNode {
  id: string;
  title: string;
  description: string;
  priority: FeaturePriority;
  done: boolean;
  children?: FeatureNode[];
}

export const featuresTree: FeatureNode[] = [
  {
    id: "security-advanced",
    title: "Seguridad productiva avanzada",
    description: "Rate-limit distribuido, WAF, reputación IP y hardening adicional para exposición pública.",
    priority: "must",
    done: true,
    children: [
      {
        id: "rl-distributed",
        title: "Rate-limit distribuido",
        description: "rl_take distribuido en Supabase con fallback local para continuidad operativa.",
        priority: "must",
        done: true,
      },
      {
        id: "waf-rules",
        title: "Reglas WAF y listas de IP",
        description: "Integración de ip_reputation para bloqueo/challenge y sincronización con WAF externa.",
        priority: "should",
        done: true,
      },
    ],
  },
  {
    id: "economy-governance",
    title: "Economía y gobernanza",
    description: "Ledger contable doble entrada, reconciliación de pagos y reglas de gobernanza de símbolos.",
    priority: "must",
    done: true,
    children: [
      {
        id: "double-entry-ledger",
        title: "Ledger contable doble entrada",
        description: "Transacciones y asientos balanceados con chequeo de invariante débito/crédito.",
        priority: "must",
        done: true,
      },
      {
        id: "payment-reconciliation",
        title: "Reconciliación de pagos",
        description: "Idempotencia por payment_intent y conciliación de estado de órdenes.",
        priority: "must",
        done: true,
      },
    ],
  },
  {
    id: "symbolic-ai",
    title: "IA simbólica operativa",
    description: "Búsqueda híbrida y ranking de calidad de candidatos en el pipeline de forja.",
    priority: "should",
    done: true,
  },
];
