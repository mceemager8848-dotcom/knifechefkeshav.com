export const PRODUCT = {
  name: "ZWILLING Twin Signature 2-Piece Knife Set",
  shortName: "ZWILLING 2-Piece Knife Set",
  regularPrice: 7500,
  offerPrice: 6999,
  currency: "NPR",
  deliveryFees: {
    inside: 100,
    outside: 150,
  },
  images: [
    {
      src: "/images/zwilling-set.png",
      alt: "ZWILLING chef's knife and paring knife set",
    },
    {
      src: "/images/zwilling-chef-board.png",
      alt: "ZWILLING chef's knife on a wooden board",
    },
    {
      src: "/images/zwilling-chef.png",
      alt: "ZWILLING chef's knife with three-rivet handle",
    },
    {
      src: "/images/zwilling-santoku.png",
      alt: "ZWILLING knife with ice-hardened steel blade",
    },
  ],
} as const;

export type DeliveryZone = keyof typeof PRODUCT.deliveryFees;

export function formatNpr(value: number) {
  return `Rs ${new Intl.NumberFormat("en-NP").format(value)}`;
}

export function deliveryLabel(zone: DeliveryZone) {
  return zone === "inside" ? "Inside Kathmandu Valley" : "Outside Kathmandu Valley";
}

export function orderTotal(quantity: number, zone: DeliveryZone) {
  return PRODUCT.offerPrice * quantity + PRODUCT.deliveryFees[zone];
}

export function checkoutHref(quantity = 1, zone: DeliveryZone = "inside") {
  return `/checkout?quantity=${quantity}&zone=${zone}`;
}
