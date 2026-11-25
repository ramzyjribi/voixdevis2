import { Type, type FunctionDeclaration, type Schema } from "@google/genai";

const stringSchema = (description: string): Schema => ({
  type: Type.STRING,
  description,
});

const numberSchema = (
  description: string,
  minimum?: number,
  maximum?: number,
): Schema => ({
  type: Type.NUMBER,
  description,
  minimum,
  maximum,
});

const objectSchema = (
  properties: Record<string, Schema>,
  required: string[] = [],
): Schema => ({
  type: Type.OBJECT,
  properties,
  required,
});

const emptyArgsSchema = objectSchema({});

export const geminiFunctionDeclarations: FunctionDeclaration[] = [
  {
    name: "set_client_info",
    description: "Met a jour les informations client du devis.",
    parameters: objectSchema({
      name: stringSchema("Nom du client."),
      address: stringSchema("Adresse du client."),
      city: stringSchema("Ville du client."),
    }),
  },
  {
    name: "apply_intervention_template",
    description:
      "Ajoute au devis un template d'intervention complet depuis le catalogue.",
    parameters: objectSchema(
      {
        templateId: stringSchema("ID strict du template, par exemple TMP_WC_POSER_REMPL."),
        sectionName: stringSchema("Nom de section ou de piece si precise."),
      },
      ["templateId"],
    ),
  },
  {
    name: "add_article",
    description: "Ajoute un article catalogue atomique au devis.",
    parameters: objectSchema(
      {
        articleId: stringSchema("ID strict de l'article catalogue."),
        quantity: numberSchema("Quantite a ajouter.", 0),
        sectionName: stringSchema("Nom de section ou de piece si precise."),
      },
      ["articleId"],
    ),
  },
  {
    name: "add_custom_line",
    description:
      "Ajoute une ligne libre quand aucune entree catalogue ne correspond.",
    parameters: objectSchema(
      {
        designation: stringSchema("Libelle clair de la prestation."),
        price: numberSchema("Prix unitaire hors taxes.", 0),
        unit: stringSchema("Unite de vente, par exemple forfait, h, u ou ml."),
        quantity: numberSchema("Quantite.", 0),
        sectionName: stringSchema("Nom de section ou de piece si precise."),
      },
      ["designation", "price", "unit", "quantity"],
    ),
  },
  {
    name: "update_article",
    description:
      "Modifie une ligne existante en utilisant uniquement son lineItemId.",
    parameters: objectSchema(
      {
        lineItemId: stringSchema("Identifiant unique de ligne du devis courant."),
        quantity: numberSchema("Nouvelle quantite.", 0),
        price: numberSchema("Nouveau prix unitaire hors taxes.", 0),
        designation: stringSchema("Nouveau libelle de ligne."),
      },
      ["lineItemId"],
    ),
  },
  {
    name: "remove_article",
    description:
      "Supprime une ligne existante en utilisant uniquement son lineItemId.",
    parameters: objectSchema(
      {
        lineItemId: stringSchema("Identifiant unique de ligne du devis courant."),
      },
      ["lineItemId"],
    ),
  },
  {
    name: "delete_section",
    description: "Supprime toute une section du devis courant.",
    parameters: objectSchema(
      {
        sectionName: stringSchema("Nom exact ou equivalent de la section."),
      },
      ["sectionName"],
    ),
  },
  {
    name: "set_tva",
    description: "Definit le taux de TVA du devis. Valeurs autorisees: 5.5, 10, 20.",
    parameters: objectSchema(
      {
        rate: numberSchema("Taux de TVA: 5.5, 10 ou 20."),
      },
      ["rate"],
    ),
  },
  {
    name: "apply_discount",
    description: "Applique une remise globale au devis.",
    parameters: objectSchema(
      {
        type: {
          type: Type.STRING,
          format: "enum",
          enum: ["percent", "fixed"],
          description: "Type de remise.",
        },
        value: numberSchema("Valeur de remise.", 0),
      },
      ["type", "value"],
    ),
  },
  {
    name: "answer_question",
    description:
      "Repond brievement a une question sur le devis sans modifier l'etat.",
    parameters: objectSchema(
      {
        userMessageFeedback: stringSchema("Reponse courte a afficher dans le chat."),
      },
      ["userMessageFeedback"],
    ),
  },
  {
    name: "trigger_pdf_export",
    description: "Demande a l'interface de declencher l'export PDF.",
    parameters: emptyArgsSchema,
  },
  {
    name: "reset_quote",
    description: "Demande la reinitialisation du devis courant.",
    parameters: emptyArgsSchema,
  },
  {
    name: "request_clarification",
    description:
      "Demande une precision lorsque plusieurs articles ou templates sont possibles.",
    parameters: objectSchema(
      {
        userMessageFeedback: stringSchema("Question courte a poser a l'utilisateur."),
        candidates: {
          type: Type.ARRAY,
          items: stringSchema("ID candidat article."),
          description: "IDs d'articles candidats issus du catalogue.",
        },
      },
      ["userMessageFeedback"],
    ),
  },
  {
    name: "unknown_action",
    description:
      "Signale une intention hors sujet ou impossible a appliquer au devis.",
    parameters: objectSchema(
      {
        userMessageFeedback: stringSchema("Message court expliquant le refus."),
      },
      ["userMessageFeedback"],
    ),
  },
];

export const geminiFunctionNames = geminiFunctionDeclarations
  .map((tool) => tool.name)
  .filter((name): name is string => Boolean(name));
