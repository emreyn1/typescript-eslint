export interface Product {
  id: string
  slug: string
  name: string
  brand: string
  tagline: string
  description: string
  price: number
  originalPrice?: number
  category: "25ml Collection" | "85ml Collection"
  scentFamily: "Floral" | "Woody" | "Oriental" | "Fresh" | "Citrus"
  topNotes: string[]
  middleNotes: string[]
  baseNotes: string[]
  sizes: { ml: number; price: number }[]
  rating: number
  reviewCount: number
  imageGradient: [string, string]
  imageUrl?: string
  featured: boolean
}

export const products: Product[] = [
  {
    "id": "1",
    "slug": "genie",
    "name": "GÉNIE",
    "brand": "Génie Collection",
    "tagline": "Luxury fragrance for the discerning",
    "description": "GÉNIE - A refined fragrance from the Génie Collection. Crafted with care for lasting elegance.",
    "price": 35,
    "category": "25ml Collection",
    "scentFamily": "Floral",
    "topNotes": [],
    "middleNotes": [],
    "baseNotes": [],
    "sizes": [
      {
        "ml": 25,
        "price": 35
      }
    ],
    "rating": 4.5,
    "reviewCount": 0,
    "imageGradient": [
      "#2D1B2E",
      "#8B4572"
    ],
    "imageUrl": "/products/img812.png",
    "featured": true
  },
  {
    "id": "2",
    "slug": "genie-collection-01009",
    "name": "GENIE COLLECTION",
    "brand": "Génie Collection",
    "tagline": "Luxury fragrance for the discerning",
    "description": "GENIE COLLECTION - A refined fragrance from the Génie Collection. Crafted with care for lasting elegance.",
    "price": 35,
    "category": "25ml Collection",
    "scentFamily": "Floral",
    "topNotes": [],
    "middleNotes": [],
    "baseNotes": [],
    "sizes": [
      {
        "ml": 25,
        "price": 35
      }
    ],
    "rating": 4.5,
    "reviewCount": 0,
    "imageGradient": [
      "#2D1B2E",
      "#8B4572"
    ],
    "imageUrl": "/products/img814.png",
    "featured": true
  },
  {
    "id": "3",
    "slug": "genie-collection-8817",
    "name": "GENIE COLLECTION",
    "brand": "Génie Collection",
    "tagline": "Luxury fragrance for the discerning",
    "description": "GENIE COLLECTION - A refined fragrance from the Génie Collection. Crafted with care for lasting elegance.",
    "price": 35,
    "category": "25ml Collection",
    "scentFamily": "Floral",
    "topNotes": [],
    "middleNotes": [],
    "baseNotes": [],
    "sizes": [
      {
        "ml": 25,
        "price": 35
      }
    ],
    "rating": 4.5,
    "reviewCount": 0,
    "imageGradient": [
      "#2D1B2E",
      "#8B4572"
    ],
    "imageUrl": "/products/img817.png",
    "featured": true
  },
  {
    "id": "4",
    "slug": "genie-collection-018804",
    "name": "GENIE COLLECTION",
    "brand": "Génie Collection",
    "tagline": "Luxury fragrance for the discerning",
    "description": "GENIE COLLECTION - A refined fragrance from the Génie Collection. Crafted with care for lasting elegance.",
    "price": 35,
    "category": "25ml Collection",
    "scentFamily": "Floral",
    "topNotes": [],
    "middleNotes": [],
    "baseNotes": [],
    "sizes": [
      {
        "ml": 25,
        "price": 35
      }
    ],
    "rating": 4.5,
    "reviewCount": 0,
    "imageGradient": [
      "#2D1B2E",
      "#8B4572"
    ],
    "imageUrl": "/products/img818.png",
    "featured": true
  },
  {
    "id": "5",
    "slug": "genie-collection-5535",
    "name": "GENIE COLLECTION",
    "brand": "Génie Collection",
    "tagline": "Luxury fragrance for the discerning",
    "description": "GENIE COLLECTION - A refined fragrance from the Génie Collection. Crafted with care for lasting elegance.",
    "price": 35,
    "category": "25ml Collection",
    "scentFamily": "Floral",
    "topNotes": [],
    "middleNotes": [],
    "baseNotes": [],
    "sizes": [
      {
        "ml": 25,
        "price": 35
      }
    ],
    "rating": 4.5,
    "reviewCount": 0,
    "imageGradient": [
      "#2D1B2E",
      "#8B4572"
    ],
    "imageUrl": "/products/img819.png",
    "featured": true
  },
  {
    "id": "6",
    "slug": "genie-collection-01901",
    "name": "GENIE COLLECTION",
    "brand": "Génie Collection",
    "tagline": "Luxury fragrance for the discerning",
    "description": "GENIE COLLECTION - A refined fragrance from the Génie Collection. Crafted with care for lasting elegance.",
    "price": 35,
    "category": "25ml Collection",
    "scentFamily": "Floral",
    "topNotes": [],
    "middleNotes": [],
    "baseNotes": [],
    "sizes": [
      {
        "ml": 25,
        "price": 35
      }
    ],
    "rating": 4.5,
    "reviewCount": 0,
    "imageGradient": [
      "#2D1B2E",
      "#8B4572"
    ],
    "imageUrl": "/products/img826.png",
    "featured": true
  },
  {
    "id": "7",
    "slug": "genie-eau-de-parfum-9032",
    "name": "GÉNIE EAU DE PARFUM",
    "brand": "Génie Collection",
    "tagline": "Luxury fragrance for the discerning",
    "description": "GÉNIE EAU DE PARFUM - A refined fragrance from the Génie Collection. Crafted with care for lasting elegance.",
    "price": 35,
    "category": "25ml Collection",
    "scentFamily": "Floral",
    "topNotes": [],
    "middleNotes": [],
    "baseNotes": [],
    "sizes": [
      {
        "ml": 25,
        "price": 35
      }
    ],
    "rating": 4.5,
    "reviewCount": 0,
    "imageGradient": [
      "#2D1B2E",
      "#8B4572"
    ],
    "imageUrl": "/products/img831.png",
    "featured": true
  },
  {
    "id": "8",
    "slug": "genie-eau-de-parfum-5551",
    "name": "GÉNIE EAU DE PARFUM",
    "brand": "Génie Collection",
    "tagline": "Luxury fragrance for the discerning",
    "description": "GÉNIE EAU DE PARFUM - A refined fragrance from the Génie Collection. Crafted with care for lasting elegance.",
    "price": 35,
    "category": "25ml Collection",
    "scentFamily": "Floral",
    "topNotes": [],
    "middleNotes": [],
    "baseNotes": [],
    "sizes": [
      {
        "ml": 25,
        "price": 35
      }
    ],
    "rating": 4.5,
    "reviewCount": 0,
    "imageGradient": [
      "#2D1B2E",
      "#8B4572"
    ],
    "imageUrl": "/products/img832.png",
    "featured": true
  },
  {
    "id": "9",
    "slug": "black-genie-collection-018837",
    "name": "BLACK GENIE COLLECTION",
    "brand": "Génie Collection",
    "tagline": "Luxury fragrance for the discerning",
    "description": "BLACK GENIE COLLECTION - A refined fragrance from the Génie Collection. Crafted with care for lasting elegance.",
    "price": 35,
    "category": "25ml Collection",
    "scentFamily": "Floral",
    "topNotes": [],
    "middleNotes": [],
    "baseNotes": [],
    "sizes": [
      {
        "ml": 25,
        "price": 35
      }
    ],
    "rating": 4.5,
    "reviewCount": 0,
    "imageGradient": [
      "#2D1B2E",
      "#8B4572"
    ],
    "imageUrl": "/products/img836.png",
    "featured": false
  },
  {
    "id": "10",
    "slug": "genie-collection-1777",
    "name": "GENIE COLLECTION",
    "brand": "Génie Collection",
    "tagline": "Luxury fragrance for the discerning",
    "description": "GENIE COLLECTION - A refined fragrance from the Génie Collection. Crafted with care for lasting elegance.",
    "price": 35,
    "category": "25ml Collection",
    "scentFamily": "Floral",
    "topNotes": [],
    "middleNotes": [],
    "baseNotes": [],
    "sizes": [
      {
        "ml": 25,
        "price": 35
      }
    ],
    "rating": 4.5,
    "reviewCount": 0,
    "imageGradient": [
      "#2D1B2E",
      "#8B4572"
    ],
    "imageUrl": "/products/img838.png",
    "featured": false
  },
  {
    "id": "11",
    "slug": "genie-collection-011013",
    "name": "GENIE COLLECTION",
    "brand": "Génie Collection",
    "tagline": "Luxury fragrance for the discerning",
    "description": "GENIE COLLECTION - A refined fragrance from the Génie Collection. Crafted with care for lasting elegance.",
    "price": 35,
    "category": "25ml Collection",
    "scentFamily": "Floral",
    "topNotes": [],
    "middleNotes": [],
    "baseNotes": [],
    "sizes": [
      {
        "ml": 25,
        "price": 35
      }
    ],
    "rating": 4.5,
    "reviewCount": 0,
    "imageGradient": [
      "#2D1B2E",
      "#8B4572"
    ],
    "imageUrl": "/products/img847.png",
    "featured": false
  },
  {
    "id": "12",
    "slug": "genie-collection-9030",
    "name": "GÉNIE COLLECTION",
    "brand": "Génie Collection",
    "tagline": "Luxury fragrance for the discerning",
    "description": "GÉNIE COLLECTION - A refined fragrance from the Génie Collection. Crafted with care for lasting elegance.",
    "price": 35,
    "category": "25ml Collection",
    "scentFamily": "Floral",
    "topNotes": [],
    "middleNotes": [],
    "baseNotes": [],
    "sizes": [
      {
        "ml": 25,
        "price": 35
      }
    ],
    "rating": 4.5,
    "reviewCount": 0,
    "imageGradient": [
      "#2D1B2E",
      "#8B4572"
    ],
    "imageUrl": "/products/img849.png",
    "featured": false
  },
  {
    "id": "13",
    "slug": "genie-collection-830",
    "name": "GENIE COLLECTION",
    "brand": "Génie Collection",
    "tagline": "Luxury fragrance for the discerning",
    "description": "GENIE COLLECTION - A refined fragrance from the Génie Collection. Crafted with care for lasting elegance.",
    "price": 35,
    "category": "25ml Collection",
    "scentFamily": "Floral",
    "topNotes": [],
    "middleNotes": [],
    "baseNotes": [],
    "sizes": [
      {
        "ml": 25,
        "price": 35
      }
    ],
    "rating": 4.5,
    "reviewCount": 0,
    "imageGradient": [
      "#2D1B2E",
      "#8B4572"
    ],
    "imageUrl": "/products/img851.png",
    "featured": false
  },
  {
    "id": "14",
    "slug": "genie-collection-8862",
    "name": "GENIE COLLECTION",
    "brand": "Génie Collection",
    "tagline": "Luxury fragrance for the discerning",
    "description": "GENIE COLLECTION - A refined fragrance from the Génie Collection. Crafted with care for lasting elegance.",
    "price": 35,
    "category": "25ml Collection",
    "scentFamily": "Floral",
    "topNotes": [],
    "middleNotes": [],
    "baseNotes": [],
    "sizes": [
      {
        "ml": 25,
        "price": 35
      }
    ],
    "rating": 4.5,
    "reviewCount": 0,
    "imageGradient": [
      "#2D1B2E",
      "#8B4572"
    ],
    "imageUrl": "/products/img859.png",
    "featured": false
  },
  {
    "id": "15",
    "slug": "genie-collection-8863",
    "name": "GENIE COLLECTION",
    "brand": "Génie Collection",
    "tagline": "Luxury fragrance for the discerning",
    "description": "GENIE COLLECTION - A refined fragrance from the Génie Collection. Crafted with care for lasting elegance.",
    "price": 35,
    "category": "25ml Collection",
    "scentFamily": "Floral",
    "topNotes": [],
    "middleNotes": [],
    "baseNotes": [],
    "sizes": [
      {
        "ml": 25,
        "price": 35
      }
    ],
    "rating": 4.5,
    "reviewCount": 0,
    "imageGradient": [
      "#2D1B2E",
      "#8B4572"
    ],
    "imageUrl": "/products/img865.png",
    "featured": false
  },
  {
    "id": "16",
    "slug": "genie-collection-8864",
    "name": "GENIE COLLECTION",
    "brand": "Génie Collection",
    "tagline": "Luxury fragrance for the discerning",
    "description": "GENIE COLLECTION - A refined fragrance from the Génie Collection. Crafted with care for lasting elegance.",
    "price": 35,
    "category": "25ml Collection",
    "scentFamily": "Floral",
    "topNotes": [],
    "middleNotes": [],
    "baseNotes": [],
    "sizes": [
      {
        "ml": 25,
        "price": 35
      }
    ],
    "rating": 4.5,
    "reviewCount": 0,
    "imageGradient": [
      "#2D1B2E",
      "#8B4572"
    ],
    "imageUrl": "/products/img866.png",
    "featured": false
  },
  {
    "id": "17",
    "slug": "genie-collection-harmony-2370",
    "name": "GENIE COLLECTION HARMONY",
    "brand": "Génie Collection",
    "tagline": "Luxury fragrance for the discerning",
    "description": "GENIE COLLECTION HARMONY - A refined fragrance from the Génie Collection. Crafted with care for lasting elegance.",
    "price": 35,
    "category": "25ml Collection",
    "scentFamily": "Floral",
    "topNotes": [],
    "middleNotes": [],
    "baseNotes": [],
    "sizes": [
      {
        "ml": 25,
        "price": 35
      }
    ],
    "rating": 4.5,
    "reviewCount": 0,
    "imageGradient": [
      "#2D1B2E",
      "#8B4572"
    ],
    "imageUrl": "/products/img867.png",
    "featured": false
  },
  {
    "id": "18",
    "slug": "genie-collection-harmony-8868",
    "name": "GENIE COLLECTION HARMONY",
    "brand": "Génie Collection",
    "tagline": "Luxury fragrance for the discerning",
    "description": "GENIE COLLECTION HARMONY - A refined fragrance from the Génie Collection. Crafted with care for lasting elegance.",
    "price": 35,
    "category": "25ml Collection",
    "scentFamily": "Floral",
    "topNotes": [],
    "middleNotes": [],
    "baseNotes": [],
    "sizes": [
      {
        "ml": 25,
        "price": 35
      }
    ],
    "rating": 4.5,
    "reviewCount": 0,
    "imageGradient": [
      "#2D1B2E",
      "#8B4572"
    ],
    "imageUrl": "/products/img868.png",
    "featured": false
  },
  {
    "id": "19",
    "slug": "genie-collection-harmony-8869",
    "name": "GENIE COLLECTION HARMONY",
    "brand": "Génie Collection",
    "tagline": "Luxury fragrance for the discerning",
    "description": "GENIE COLLECTION HARMONY - A refined fragrance from the Génie Collection. Crafted with care for lasting elegance.",
    "price": 35,
    "category": "25ml Collection",
    "scentFamily": "Floral",
    "topNotes": [],
    "middleNotes": [],
    "baseNotes": [],
    "sizes": [
      {
        "ml": 25,
        "price": 35
      }
    ],
    "rating": 4.5,
    "reviewCount": 0,
    "imageGradient": [
      "#2D1B2E",
      "#8B4572"
    ],
    "imageUrl": "/products/img869.png",
    "featured": false
  },
  {
    "id": "20",
    "slug": "genie-collection-015821",
    "name": "GENIE COLLECTION",
    "brand": "Génie Collection",
    "tagline": "Luxury fragrance for the discerning",
    "description": "GENIE COLLECTION - A refined fragrance from the Génie Collection. Crafted with care for lasting elegance.",
    "price": 35,
    "category": "25ml Collection",
    "scentFamily": "Floral",
    "topNotes": [],
    "middleNotes": [],
    "baseNotes": [],
    "sizes": [
      {
        "ml": 25,
        "price": 35
      }
    ],
    "rating": 4.5,
    "reviewCount": 0,
    "imageGradient": [
      "#2D1B2E",
      "#8B4572"
    ],
    "imageUrl": "/products/img870.png",
    "featured": false
  },
  {
    "id": "21",
    "slug": "genie-collection-8877",
    "name": "GENIE COLLECTION",
    "brand": "Génie Collection",
    "tagline": "Luxury fragrance for the discerning",
    "description": "GENIE COLLECTION - A refined fragrance from the Génie Collection. Crafted with care for lasting elegance.",
    "price": 35,
    "category": "25ml Collection",
    "scentFamily": "Floral",
    "topNotes": [],
    "middleNotes": [],
    "baseNotes": [],
    "sizes": [
      {
        "ml": 25,
        "price": 35
      }
    ],
    "rating": 4.5,
    "reviewCount": 0,
    "imageGradient": [
      "#2D1B2E",
      "#8B4572"
    ],
    "imageUrl": "/products/img871.png",
    "featured": false
  },
  {
    "id": "22",
    "slug": "genie-collection-8878",
    "name": "GENIE COLLECTION",
    "brand": "Génie Collection",
    "tagline": "Luxury fragrance for the discerning",
    "description": "GENIE COLLECTION - A refined fragrance from the Génie Collection. Crafted with care for lasting elegance.",
    "price": 35,
    "category": "25ml Collection",
    "scentFamily": "Floral",
    "topNotes": [],
    "middleNotes": [],
    "baseNotes": [],
    "sizes": [
      {
        "ml": 25,
        "price": 35
      }
    ],
    "rating": 4.5,
    "reviewCount": 0,
    "imageGradient": [
      "#2D1B2E",
      "#8B4572"
    ],
    "imageUrl": "/products/img872.png",
    "featured": false
  },
  {
    "id": "23",
    "slug": "in-love-with-gc-freeze-019496",
    "name": "IN LOVE WITH GC FREEZE",
    "brand": "Génie Collection",
    "tagline": "Luxury fragrance for the discerning",
    "description": "IN LOVE WITH GC FREEZE - A refined fragrance from the Génie Collection. Crafted with care for lasting elegance.",
    "price": 35,
    "category": "25ml Collection",
    "scentFamily": "Floral",
    "topNotes": [],
    "middleNotes": [],
    "baseNotes": [],
    "sizes": [
      {
        "ml": 25,
        "price": 35
      }
    ],
    "rating": 4.5,
    "reviewCount": 0,
    "imageGradient": [
      "#2D1B2E",
      "#8B4572"
    ],
    "imageUrl": "/products/img878.png",
    "featured": false
  },
  {
    "id": "24",
    "slug": "genie-code-015817",
    "name": "GENIE CODE",
    "brand": "Génie Collection",
    "tagline": "Luxury fragrance for the discerning",
    "description": "GENIE CODE - A refined fragrance from the Génie Collection. Crafted with care for lasting elegance.",
    "price": 35,
    "category": "25ml Collection",
    "scentFamily": "Floral",
    "topNotes": [],
    "middleNotes": [],
    "baseNotes": [],
    "sizes": [
      {
        "ml": 25,
        "price": 35
      }
    ],
    "rating": 4.5,
    "reviewCount": 0,
    "imageGradient": [
      "#2D1B2E",
      "#8B4572"
    ],
    "imageUrl": "/products/img879.png",
    "featured": false
  },
  {
    "id": "25",
    "slug": "genie-code-profumo",
    "name": "GÉNIE CODE PROFUMO",
    "brand": "Génie Collection",
    "tagline": "Luxury fragrance for the discerning",
    "description": "GÉNIE CODE PROFUMO - A refined fragrance from the Génie Collection. Crafted with care for lasting elegance.",
    "price": 35,
    "category": "25ml Collection",
    "scentFamily": "Floral",
    "topNotes": [],
    "middleNotes": [],
    "baseNotes": [],
    "sizes": [
      {
        "ml": 25,
        "price": 35
      }
    ],
    "rating": 4.5,
    "reviewCount": 0,
    "imageGradient": [
      "#2D1B2E",
      "#8B4572"
    ],
    "imageUrl": "/products/img880.png",
    "featured": false
  },
  {
    "id": "26",
    "slug": "genie-collection-012225",
    "name": "GENIE COLLECTION",
    "brand": "Génie Collection",
    "tagline": "Luxury fragrance for the discerning",
    "description": "GENIE COLLECTION - A refined fragrance from the Génie Collection. Crafted with care for lasting elegance.",
    "price": 35,
    "category": "25ml Collection",
    "scentFamily": "Floral",
    "topNotes": [],
    "middleNotes": [],
    "baseNotes": [],
    "sizes": [
      {
        "ml": 25,
        "price": 35
      }
    ],
    "rating": 4.5,
    "reviewCount": 0,
    "imageGradient": [
      "#2D1B2E",
      "#8B4572"
    ],
    "imageUrl": "/products/img881.png",
    "featured": false
  },
  {
    "id": "27",
    "slug": "genie-collection-8828",
    "name": "GENIE COLLECTION",
    "brand": "Génie Collection",
    "tagline": "Luxury fragrance for the discerning",
    "description": "GENIE COLLECTION - A refined fragrance from the Génie Collection. Crafted with care for lasting elegance.",
    "price": 35,
    "category": "25ml Collection",
    "scentFamily": "Floral",
    "topNotes": [],
    "middleNotes": [],
    "baseNotes": [],
    "sizes": [
      {
        "ml": 25,
        "price": 35
      }
    ],
    "rating": 4.5,
    "reviewCount": 0,
    "imageGradient": [
      "#2D1B2E",
      "#8B4572"
    ],
    "imageUrl": "/products/img882.png",
    "featured": false
  },
  {
    "id": "28",
    "slug": "genie-collection-8860",
    "name": "GENIE COLLECTION",
    "brand": "Génie Collection",
    "tagline": "Luxury fragrance for the discerning",
    "description": "GENIE COLLECTION - A refined fragrance from the Génie Collection. Crafted with care for lasting elegance.",
    "price": 35,
    "category": "25ml Collection",
    "scentFamily": "Floral",
    "topNotes": [],
    "middleNotes": [],
    "baseNotes": [],
    "sizes": [
      {
        "ml": 25,
        "price": 35
      }
    ],
    "rating": 4.5,
    "reviewCount": 0,
    "imageGradient": [
      "#2D1B2E",
      "#8B4572"
    ],
    "imageUrl": "/products/img884.png",
    "featured": false
  },
  {
    "id": "29",
    "slug": "genie-collection-8861",
    "name": "GENIE COLLECTION",
    "brand": "Génie Collection",
    "tagline": "Luxury fragrance for the discerning",
    "description": "GENIE COLLECTION - A refined fragrance from the Génie Collection. Crafted with care for lasting elegance.",
    "price": 35,
    "category": "25ml Collection",
    "scentFamily": "Floral",
    "topNotes": [],
    "middleNotes": [],
    "baseNotes": [],
    "sizes": [
      {
        "ml": 25,
        "price": 35
      }
    ],
    "rating": 4.5,
    "reviewCount": 0,
    "imageGradient": [
      "#2D1B2E",
      "#8B4572"
    ],
    "imageUrl": "/products/img885.png",
    "featured": false
  },
  {
    "id": "30",
    "slug": "genie-collection-886",
    "name": "GENIE COLLECTION",
    "brand": "Génie Collection",
    "tagline": "Luxury fragrance for the discerning",
    "description": "GENIE COLLECTION - A refined fragrance from the Génie Collection. Crafted with care for lasting elegance.",
    "price": 35,
    "category": "25ml Collection",
    "scentFamily": "Floral",
    "topNotes": [],
    "middleNotes": [],
    "baseNotes": [],
    "sizes": [
      {
        "ml": 25,
        "price": 35
      }
    ],
    "rating": 4.5,
    "reviewCount": 0,
    "imageGradient": [
      "#2D1B2E",
      "#8B4572"
    ],
    "imageUrl": "/products/img891.png",
    "featured": false
  },
  {
    "id": "31",
    "slug": "genie-collection-8899",
    "name": "GENIE COLLECTION",
    "brand": "Génie Collection",
    "tagline": "Luxury fragrance for the discerning",
    "description": "GENIE COLLECTION - A refined fragrance from the Génie Collection. Crafted with care for lasting elegance.",
    "price": 35,
    "category": "25ml Collection",
    "scentFamily": "Floral",
    "topNotes": [],
    "middleNotes": [],
    "baseNotes": [],
    "sizes": [
      {
        "ml": 25,
        "price": 35
      }
    ],
    "rating": 4.5,
    "reviewCount": 0,
    "imageGradient": [
      "#2D1B2E",
      "#8B4572"
    ],
    "imageUrl": "/products/img892.png",
    "featured": false
  },
  {
    "id": "32",
    "slug": "genie-collection-018557",
    "name": "GENIE COLLECTION",
    "brand": "Génie Collection",
    "tagline": "Luxury fragrance for the discerning",
    "description": "GENIE COLLECTION - A refined fragrance from the Génie Collection. Crafted with care for lasting elegance.",
    "price": 35,
    "category": "25ml Collection",
    "scentFamily": "Floral",
    "topNotes": [],
    "middleNotes": [],
    "baseNotes": [],
    "sizes": [
      {
        "ml": 25,
        "price": 35
      }
    ],
    "rating": 4.5,
    "reviewCount": 0,
    "imageGradient": [
      "#2D1B2E",
      "#8B4572"
    ],
    "imageUrl": "/products/img893.png",
    "featured": false
  },
  {
    "id": "33",
    "slug": "gris-genie",
    "name": "GRIS GENIE",
    "brand": "Génie Collection",
    "tagline": "Luxury fragrance for the discerning",
    "description": "GRIS GENIE - A refined fragrance from the Génie Collection. Crafted with care for lasting elegance.",
    "price": 35,
    "category": "25ml Collection",
    "scentFamily": "Floral",
    "topNotes": [],
    "middleNotes": [],
    "baseNotes": [],
    "sizes": [
      {
        "ml": 25,
        "price": 35
      }
    ],
    "rating": 4.5,
    "reviewCount": 0,
    "imageGradient": [
      "#2D1B2E",
      "#8B4572"
    ],
    "imageUrl": "/products/img894.png",
    "featured": false
  },
  {
    "id": "34",
    "slug": "ambre-genie-015815",
    "name": "AMBRE GENIE",
    "brand": "Génie Collection",
    "tagline": "Luxury fragrance for the discerning",
    "description": "AMBRE GENIE - A refined fragrance from the Génie Collection. Crafted with care for lasting elegance.",
    "price": 35,
    "category": "25ml Collection",
    "scentFamily": "Floral",
    "topNotes": [],
    "middleNotes": [],
    "baseNotes": [],
    "sizes": [
      {
        "ml": 25,
        "price": 35
      }
    ],
    "rating": 4.5,
    "reviewCount": 0,
    "imageGradient": [
      "#2D1B2E",
      "#8B4572"
    ],
    "imageUrl": "/products/img895.png",
    "featured": false
  },
  {
    "id": "35",
    "slug": "genie-collection-8818",
    "name": "GENIE COLLECTION",
    "brand": "Génie Collection",
    "tagline": "Luxury fragrance for the discerning",
    "description": "GENIE COLLECTION - A refined fragrance from the Génie Collection. Crafted with care for lasting elegance.",
    "price": 35,
    "category": "25ml Collection",
    "scentFamily": "Floral",
    "topNotes": [],
    "middleNotes": [],
    "baseNotes": [],
    "sizes": [
      {
        "ml": 25,
        "price": 35
      }
    ],
    "rating": 4.5,
    "reviewCount": 0,
    "imageGradient": [
      "#2D1B2E",
      "#8B4572"
    ],
    "imageUrl": "/products/img896.png",
    "featured": false
  },
  {
    "id": "36",
    "slug": "genie-collection-8872",
    "name": "GENIE COLLECTION",
    "brand": "Génie Collection",
    "tagline": "Luxury fragrance for the discerning",
    "description": "GENIE COLLECTION - A refined fragrance from the Génie Collection. Crafted with care for lasting elegance.",
    "price": 35,
    "category": "25ml Collection",
    "scentFamily": "Floral",
    "topNotes": [],
    "middleNotes": [],
    "baseNotes": [],
    "sizes": [
      {
        "ml": 25,
        "price": 35
      }
    ],
    "rating": 4.5,
    "reviewCount": 0,
    "imageGradient": [
      "#2D1B2E",
      "#8B4572"
    ],
    "imageUrl": "/products/img897.png",
    "featured": false
  },
  {
    "id": "37",
    "slug": "genie-collection-8871",
    "name": "GENIE COLLECTION",
    "brand": "Génie Collection",
    "tagline": "Luxury fragrance for the discerning",
    "description": "GENIE COLLECTION - A refined fragrance from the Génie Collection. Crafted with care for lasting elegance.",
    "price": 35,
    "category": "25ml Collection",
    "scentFamily": "Floral",
    "topNotes": [],
    "middleNotes": [],
    "baseNotes": [],
    "sizes": [
      {
        "ml": 25,
        "price": 35
      }
    ],
    "rating": 4.5,
    "reviewCount": 0,
    "imageGradient": [
      "#2D1B2E",
      "#8B4572"
    ],
    "imageUrl": "/products/img898.png",
    "featured": false
  },
  {
    "id": "38",
    "slug": "genie-collection-5557",
    "name": "GENIE COLLECTION",
    "brand": "Génie Collection",
    "tagline": "Luxury fragrance for the discerning",
    "description": "GENIE COLLECTION - A refined fragrance from the Génie Collection. Crafted with care for lasting elegance.",
    "price": 35,
    "category": "25ml Collection",
    "scentFamily": "Floral",
    "topNotes": [],
    "middleNotes": [],
    "baseNotes": [],
    "sizes": [
      {
        "ml": 25,
        "price": 35
      }
    ],
    "rating": 4.5,
    "reviewCount": 0,
    "imageGradient": [
      "#2D1B2E",
      "#8B4572"
    ],
    "imageUrl": "/products/img904.png",
    "featured": false
  },
  {
    "id": "39",
    "slug": "genie-collection-5555",
    "name": "GENIE COLLECTION",
    "brand": "Génie Collection",
    "tagline": "Luxury fragrance for the discerning",
    "description": "GENIE COLLECTION - A refined fragrance from the Génie Collection. Crafted with care for lasting elegance.",
    "price": 35,
    "category": "25ml Collection",
    "scentFamily": "Floral",
    "topNotes": [],
    "middleNotes": [],
    "baseNotes": [],
    "sizes": [
      {
        "ml": 25,
        "price": 35
      }
    ],
    "rating": 4.5,
    "reviewCount": 0,
    "imageGradient": [
      "#2D1B2E",
      "#8B4572"
    ],
    "imageUrl": "/products/img905.png",
    "featured": false
  },
  {
    "id": "40",
    "slug": "genie-collection-5556",
    "name": "GENIE COLLECTION",
    "brand": "Génie Collection",
    "tagline": "Luxury fragrance for the discerning",
    "description": "GENIE COLLECTION - A refined fragrance from the Génie Collection. Crafted with care for lasting elegance.",
    "price": 35,
    "category": "25ml Collection",
    "scentFamily": "Floral",
    "topNotes": [],
    "middleNotes": [],
    "baseNotes": [],
    "sizes": [
      {
        "ml": 25,
        "price": 35
      }
    ],
    "rating": 4.5,
    "reviewCount": 0,
    "imageGradient": [
      "#2D1B2E",
      "#8B4572"
    ],
    "imageUrl": "/products/img906.png",
    "featured": false
  },
  {
    "id": "41",
    "slug": "genie-collection-5533",
    "name": "GENIE COLLECTION",
    "brand": "Génie Collection",
    "tagline": "Luxury fragrance for the discerning",
    "description": "GENIE COLLECTION - A refined fragrance from the Génie Collection. Crafted with care for lasting elegance.",
    "price": 35,
    "category": "25ml Collection",
    "scentFamily": "Floral",
    "topNotes": [],
    "middleNotes": [],
    "baseNotes": [],
    "sizes": [
      {
        "ml": 25,
        "price": 35
      }
    ],
    "rating": 4.5,
    "reviewCount": 0,
    "imageGradient": [
      "#2D1B2E",
      "#8B4572"
    ],
    "imageUrl": "/products/img907.png",
    "featured": false
  },
  {
    "id": "42",
    "slug": "genie-collection-6874",
    "name": "GENIE COLLECTION",
    "brand": "Génie Collection",
    "tagline": "Luxury fragrance for the discerning",
    "description": "GENIE COLLECTION - A refined fragrance from the Génie Collection. Crafted with care for lasting elegance.",
    "price": 35,
    "category": "25ml Collection",
    "scentFamily": "Floral",
    "topNotes": [],
    "middleNotes": [],
    "baseNotes": [],
    "sizes": [
      {
        "ml": 25,
        "price": 35
      }
    ],
    "rating": 4.5,
    "reviewCount": 0,
    "imageGradient": [
      "#2D1B2E",
      "#8B4572"
    ],
    "imageUrl": "/products/img908.png",
    "featured": false
  },
  {
    "id": "43",
    "slug": "genie-collection-8873",
    "name": "GENIE COLLECTION",
    "brand": "Génie Collection",
    "tagline": "Luxury fragrance for the discerning",
    "description": "GENIE COLLECTION - A refined fragrance from the Génie Collection. Crafted with care for lasting elegance.",
    "price": 35,
    "category": "25ml Collection",
    "scentFamily": "Floral",
    "topNotes": [],
    "middleNotes": [],
    "baseNotes": [],
    "sizes": [
      {
        "ml": 25,
        "price": 35
      }
    ],
    "rating": 4.5,
    "reviewCount": 0,
    "imageGradient": [
      "#2D1B2E",
      "#8B4572"
    ],
    "imageUrl": "/products/img909.png",
    "featured": false
  },
  {
    "id": "44",
    "slug": "live-irresistible-delicieuse",
    "name": "LIVE IRRÉSISTIBLE DELICIEUSE",
    "brand": "Génie Collection",
    "tagline": "Luxury fragrance for the discerning",
    "description": "LIVE IRRÉSISTIBLE DELICIEUSE - A refined fragrance from the Génie Collection. Crafted with care for lasting elegance.",
    "price": 35,
    "category": "25ml Collection",
    "scentFamily": "Floral",
    "topNotes": [],
    "middleNotes": [],
    "baseNotes": [],
    "sizes": [
      {
        "ml": 25,
        "price": 35
      }
    ],
    "rating": 4.5,
    "reviewCount": 0,
    "imageGradient": [
      "#2D1B2E",
      "#8B4572"
    ],
    "imageUrl": "/products/img910.png",
    "featured": false
  },
  {
    "id": "45",
    "slug": "genie-collection-613662",
    "name": "GENIE COLLECTION",
    "brand": "Génie Collection",
    "tagline": "Luxury fragrance for the discerning",
    "description": "GENIE COLLECTION - A refined fragrance from the Génie Collection. Crafted with care for lasting elegance.",
    "price": 35,
    "category": "25ml Collection",
    "scentFamily": "Floral",
    "topNotes": [],
    "middleNotes": [],
    "baseNotes": [],
    "sizes": [
      {
        "ml": 25,
        "price": 35
      }
    ],
    "rating": 4.5,
    "reviewCount": 0,
    "imageGradient": [
      "#2D1B2E",
      "#8B4572"
    ],
    "imageUrl": "/products/img923.png",
    "featured": false
  },
  {
    "id": "46",
    "slug": "genie-collection-018884",
    "name": "GENIE COLLECTION",
    "brand": "Génie Collection",
    "tagline": "Luxury fragrance for the discerning",
    "description": "GENIE COLLECTION - A refined fragrance from the Génie Collection. Crafted with care for lasting elegance.",
    "price": 35,
    "category": "25ml Collection",
    "scentFamily": "Floral",
    "topNotes": [],
    "middleNotes": [],
    "baseNotes": [],
    "sizes": [
      {
        "ml": 25,
        "price": 35
      }
    ],
    "rating": 4.5,
    "reviewCount": 0,
    "imageGradient": [
      "#2D1B2E",
      "#8B4572"
    ],
    "imageUrl": "/products/img924.png",
    "featured": false
  },
  {
    "id": "47",
    "slug": "genie-collection-018883",
    "name": "GENIE COLLECTION",
    "brand": "Génie Collection",
    "tagline": "Luxury fragrance for the discerning",
    "description": "GENIE COLLECTION - A refined fragrance from the Génie Collection. Crafted with care for lasting elegance.",
    "price": 35,
    "category": "25ml Collection",
    "scentFamily": "Floral",
    "topNotes": [],
    "middleNotes": [],
    "baseNotes": [],
    "sizes": [
      {
        "ml": 25,
        "price": 35
      }
    ],
    "rating": 4.5,
    "reviewCount": 0,
    "imageGradient": [
      "#2D1B2E",
      "#8B4572"
    ],
    "imageUrl": "/products/img925.png",
    "featured": false
  },
  {
    "id": "48",
    "slug": "genie-collection-015581",
    "name": "GENIE COLLECTION",
    "brand": "Génie Collection",
    "tagline": "Luxury fragrance for the discerning",
    "description": "GENIE COLLECTION - A refined fragrance from the Génie Collection. Crafted with care for lasting elegance.",
    "price": 35,
    "category": "25ml Collection",
    "scentFamily": "Floral",
    "topNotes": [],
    "middleNotes": [],
    "baseNotes": [],
    "sizes": [
      {
        "ml": 25,
        "price": 35
      }
    ],
    "rating": 4.5,
    "reviewCount": 0,
    "imageGradient": [
      "#2D1B2E",
      "#8B4572"
    ],
    "imageUrl": "/products/img926.png",
    "featured": false
  },
  {
    "id": "49",
    "slug": "genie-red-1016",
    "name": "GENIE RED",
    "brand": "Génie Collection",
    "tagline": "Luxury fragrance for the discerning",
    "description": "GENIE RED - A refined fragrance from the Génie Collection. Crafted with care for lasting elegance.",
    "price": 35,
    "category": "25ml Collection",
    "scentFamily": "Floral",
    "topNotes": [],
    "middleNotes": [],
    "baseNotes": [],
    "sizes": [
      {
        "ml": 25,
        "price": 35
      }
    ],
    "rating": 4.5,
    "reviewCount": 0,
    "imageGradient": [
      "#2D1B2E",
      "#8B4572"
    ],
    "imageUrl": "/products/img927.png",
    "featured": false
  },
  {
    "id": "50",
    "slug": "genie-blue-1061",
    "name": "GENIE BLUE",
    "brand": "Génie Collection",
    "tagline": "Luxury fragrance for the discerning",
    "description": "GENIE BLUE - A refined fragrance from the Génie Collection. Crafted with care for lasting elegance.",
    "price": 35,
    "category": "25ml Collection",
    "scentFamily": "Floral",
    "topNotes": [],
    "middleNotes": [],
    "baseNotes": [],
    "sizes": [
      {
        "ml": 25,
        "price": 35
      }
    ],
    "rating": 4.5,
    "reviewCount": 0,
    "imageGradient": [
      "#2D1B2E",
      "#8B4572"
    ],
    "imageUrl": "/products/img928.png",
    "featured": false
  },
  {
    "id": "51",
    "slug": "genie-collection-011075",
    "name": "GENIE COLLECTION",
    "brand": "Génie Collection",
    "tagline": "Luxury fragrance for the discerning",
    "description": "GENIE COLLECTION - A refined fragrance from the Génie Collection. Crafted with care for lasting elegance.",
    "price": 35,
    "category": "25ml Collection",
    "scentFamily": "Floral",
    "topNotes": [],
    "middleNotes": [],
    "baseNotes": [],
    "sizes": [
      {
        "ml": 25,
        "price": 35
      }
    ],
    "rating": 4.5,
    "reviewCount": 0,
    "imageGradient": [
      "#2D1B2E",
      "#8B4572"
    ],
    "imageUrl": "/products/img936.png",
    "featured": false
  },
  {
    "id": "52",
    "slug": "genie-collection-011575",
    "name": "GENIE COLLECTION",
    "brand": "Génie Collection",
    "tagline": "Luxury fragrance for the discerning",
    "description": "GENIE COLLECTION - A refined fragrance from the Génie Collection. Crafted with care for lasting elegance.",
    "price": 35,
    "category": "25ml Collection",
    "scentFamily": "Floral",
    "topNotes": [],
    "middleNotes": [],
    "baseNotes": [],
    "sizes": [
      {
        "ml": 25,
        "price": 35
      }
    ],
    "rating": 4.5,
    "reviewCount": 0,
    "imageGradient": [
      "#2D1B2E",
      "#8B4572"
    ],
    "imageUrl": "/products/img942.png",
    "featured": false
  },
  {
    "id": "53",
    "slug": "genie-collection-011045",
    "name": "GENIE COLLECTION",
    "brand": "Génie Collection",
    "tagline": "Luxury fragrance for the discerning",
    "description": "GENIE COLLECTION - A refined fragrance from the Génie Collection. Crafted with care for lasting elegance.",
    "price": 35,
    "category": "25ml Collection",
    "scentFamily": "Floral",
    "topNotes": [],
    "middleNotes": [],
    "baseNotes": [],
    "sizes": [
      {
        "ml": 25,
        "price": 35
      }
    ],
    "rating": 4.5,
    "reviewCount": 0,
    "imageGradient": [
      "#2D1B2E",
      "#8B4572"
    ],
    "imageUrl": "/products/img943.png",
    "featured": false
  },
  {
    "id": "54",
    "slug": "genie-homme-015514",
    "name": "GÉNIE HOMME",
    "brand": "Génie Collection",
    "tagline": "Luxury fragrance for the discerning",
    "description": "GÉNIE HOMME - A refined fragrance from the Génie Collection. Crafted with care for lasting elegance.",
    "price": 35,
    "category": "25ml Collection",
    "scentFamily": "Floral",
    "topNotes": [],
    "middleNotes": [],
    "baseNotes": [],
    "sizes": [
      {
        "ml": 25,
        "price": 35
      }
    ],
    "rating": 4.5,
    "reviewCount": 0,
    "imageGradient": [
      "#2D1B2E",
      "#8B4572"
    ],
    "imageUrl": "/products/img944.png",
    "featured": false
  },
  {
    "id": "55",
    "slug": "genie-collection-9090",
    "name": "GÉNIE COLLECTION",
    "brand": "Génie Collection",
    "tagline": "Luxury fragrance for the discerning",
    "description": "GÉNIE COLLECTION - A refined fragrance from the Génie Collection. Crafted with care for lasting elegance.",
    "price": 35,
    "category": "25ml Collection",
    "scentFamily": "Floral",
    "topNotes": [],
    "middleNotes": [],
    "baseNotes": [],
    "sizes": [
      {
        "ml": 25,
        "price": 35
      }
    ],
    "rating": 4.5,
    "reviewCount": 0,
    "imageGradient": [
      "#2D1B2E",
      "#8B4572"
    ],
    "imageUrl": "/products/img945.png",
    "featured": false
  },
  {
    "id": "56",
    "slug": "genie-collection-335",
    "name": "GÉNIE COLLECTION",
    "brand": "Génie Collection",
    "tagline": "Luxury fragrance for the discerning",
    "description": "GÉNIE COLLECTION - A refined fragrance from the Génie Collection. Crafted with care for lasting elegance.",
    "price": 35,
    "category": "25ml Collection",
    "scentFamily": "Floral",
    "topNotes": [],
    "middleNotes": [],
    "baseNotes": [],
    "sizes": [
      {
        "ml": 25,
        "price": 35
      }
    ],
    "rating": 4.5,
    "reviewCount": 0,
    "imageGradient": [
      "#2D1B2E",
      "#8B4572"
    ],
    "imageUrl": "/products/img946.png",
    "featured": false
  },
  {
    "id": "57",
    "slug": "genie-collection-019017",
    "name": "GÉNIE COLLECTION",
    "brand": "Génie Collection",
    "tagline": "Luxury fragrance for the discerning",
    "description": "GÉNIE COLLECTION - A refined fragrance from the Génie Collection. Crafted with care for lasting elegance.",
    "price": 35,
    "category": "25ml Collection",
    "scentFamily": "Floral",
    "topNotes": [],
    "middleNotes": [],
    "baseNotes": [],
    "sizes": [
      {
        "ml": 25,
        "price": 35
      }
    ],
    "rating": 4.5,
    "reviewCount": 0,
    "imageGradient": [
      "#2D1B2E",
      "#8B4572"
    ],
    "imageUrl": "/products/img947.png",
    "featured": false
  },
  {
    "id": "58",
    "slug": "gris-genie-015816",
    "name": "GRIS GENIE",
    "brand": "Génie Collection",
    "tagline": "Luxury fragrance for the discerning",
    "description": "GRIS GENIE - A refined fragrance from the Génie Collection. Crafted with care for lasting elegance.",
    "price": 35,
    "category": "25ml Collection",
    "scentFamily": "Floral",
    "topNotes": [],
    "middleNotes": [],
    "baseNotes": [],
    "sizes": [
      {
        "ml": 25,
        "price": 35
      }
    ],
    "rating": 4.5,
    "reviewCount": 0,
    "imageGradient": [
      "#2D1B2E",
      "#8B4572"
    ],
    "imageUrl": "/products/img948.png",
    "featured": false
  },
  {
    "id": "59",
    "slug": "genie-homme-5513",
    "name": "GÉNIE HOMME",
    "brand": "Génie Collection",
    "tagline": "Luxury fragrance for the discerning",
    "description": "GÉNIE HOMME - A refined fragrance from the Génie Collection. Crafted with care for lasting elegance.",
    "price": 35,
    "category": "25ml Collection",
    "scentFamily": "Floral",
    "topNotes": [],
    "middleNotes": [],
    "baseNotes": [],
    "sizes": [
      {
        "ml": 25,
        "price": 35
      }
    ],
    "rating": 4.5,
    "reviewCount": 0,
    "imageGradient": [
      "#2D1B2E",
      "#8B4572"
    ],
    "imageUrl": "/products/img949.png",
    "featured": false
  },
  {
    "id": "60",
    "slug": "genie-collection-8213",
    "name": "GENIE COLLECTION",
    "brand": "Génie Collection",
    "tagline": "Luxury fragrance for the discerning",
    "description": "GENIE COLLECTION - A refined fragrance from the Génie Collection. Crafted with care for lasting elegance.",
    "price": 35,
    "category": "25ml Collection",
    "scentFamily": "Floral",
    "topNotes": [],
    "middleNotes": [],
    "baseNotes": [],
    "sizes": [
      {
        "ml": 25,
        "price": 35
      }
    ],
    "rating": 4.5,
    "reviewCount": 0,
    "imageGradient": [
      "#2D1B2E",
      "#8B4572"
    ],
    "imageUrl": "/products/img963.png",
    "featured": false
  },
  {
    "id": "61",
    "slug": "genie-collection-1005",
    "name": "GENIE COLLECTION",
    "brand": "Génie Collection",
    "tagline": "Luxury fragrance for the discerning",
    "description": "GENIE COLLECTION - A refined fragrance from the Génie Collection. Crafted with care for lasting elegance.",
    "price": 35,
    "category": "25ml Collection",
    "scentFamily": "Floral",
    "topNotes": [],
    "middleNotes": [],
    "baseNotes": [],
    "sizes": [
      {
        "ml": 25,
        "price": 35
      }
    ],
    "rating": 4.5,
    "reviewCount": 0,
    "imageGradient": [
      "#2D1B2E",
      "#8B4572"
    ],
    "imageUrl": "/products/img966.png",
    "featured": false
  },
  {
    "id": "62",
    "slug": "genie-collection-noir-2006",
    "name": "GENIE COLLECTION NOIR",
    "brand": "Génie Collection",
    "tagline": "Luxury fragrance for the discerning",
    "description": "GENIE COLLECTION NOIR - A refined fragrance from the Génie Collection. Crafted with care for lasting elegance.",
    "price": 35,
    "category": "25ml Collection",
    "scentFamily": "Floral",
    "topNotes": [],
    "middleNotes": [],
    "baseNotes": [],
    "sizes": [
      {
        "ml": 25,
        "price": 35
      }
    ],
    "rating": 4.5,
    "reviewCount": 0,
    "imageGradient": [
      "#2D1B2E",
      "#8B4572"
    ],
    "imageUrl": "/products/img967.png",
    "featured": false
  },
  {
    "id": "63",
    "slug": "genie-de-collection-019013",
    "name": "GENIE DE COLLECTION",
    "brand": "Génie Collection",
    "tagline": "Luxury fragrance for the discerning",
    "description": "GENIE DE COLLECTION - A refined fragrance from the Génie Collection. Crafted with care for lasting elegance.",
    "price": 35,
    "category": "25ml Collection",
    "scentFamily": "Floral",
    "topNotes": [],
    "middleNotes": [],
    "baseNotes": [],
    "sizes": [
      {
        "ml": 25,
        "price": 35
      }
    ],
    "rating": 4.5,
    "reviewCount": 0,
    "imageGradient": [
      "#2D1B2E",
      "#8B4572"
    ],
    "imageUrl": "/products/img968.png",
    "featured": false
  },
  {
    "id": "64",
    "slug": "genie-homme-sport-011014",
    "name": "GENIE HOMME SPORT",
    "brand": "Génie Collection",
    "tagline": "Luxury fragrance for the discerning",
    "description": "GENIE HOMME SPORT - A refined fragrance from the Génie Collection. Crafted with care for lasting elegance.",
    "price": 35,
    "category": "25ml Collection",
    "scentFamily": "Floral",
    "topNotes": [],
    "middleNotes": [],
    "baseNotes": [],
    "sizes": [
      {
        "ml": 25,
        "price": 35
      }
    ],
    "rating": 4.5,
    "reviewCount": 0,
    "imageGradient": [
      "#2D1B2E",
      "#8B4572"
    ],
    "imageUrl": "/products/img969.png",
    "featured": false
  },
  {
    "id": "65",
    "slug": "genie-collection-8886",
    "name": "GENIE COLLECTION",
    "brand": "Génie Collection",
    "tagline": "Luxury fragrance for the discerning",
    "description": "GENIE COLLECTION - A refined fragrance from the Génie Collection. Crafted with care for lasting elegance.",
    "price": 35,
    "category": "25ml Collection",
    "scentFamily": "Floral",
    "topNotes": [],
    "middleNotes": [],
    "baseNotes": [],
    "sizes": [
      {
        "ml": 25,
        "price": 35
      }
    ],
    "rating": 4.5,
    "reviewCount": 0,
    "imageGradient": [
      "#2D1B2E",
      "#8B4572"
    ],
    "imageUrl": "/products/img975.png",
    "featured": false
  },
  {
    "id": "66",
    "slug": "genie-collection-8885",
    "name": "GENIE COLLECTION",
    "brand": "Génie Collection",
    "tagline": "Luxury fragrance for the discerning",
    "description": "GENIE COLLECTION - A refined fragrance from the Génie Collection. Crafted with care for lasting elegance.",
    "price": 35,
    "category": "25ml Collection",
    "scentFamily": "Floral",
    "topNotes": [],
    "middleNotes": [],
    "baseNotes": [],
    "sizes": [
      {
        "ml": 25,
        "price": 35
      }
    ],
    "rating": 4.5,
    "reviewCount": 0,
    "imageGradient": [
      "#2D1B2E",
      "#8B4572"
    ],
    "imageUrl": "/products/img976.png",
    "featured": false
  },
  {
    "id": "67",
    "slug": "genie-collection-9996",
    "name": "GENIE COLLECTION",
    "brand": "Génie Collection",
    "tagline": "Luxury fragrance for the discerning",
    "description": "GENIE COLLECTION - A refined fragrance from the Génie Collection. Crafted with care for lasting elegance.",
    "price": 35,
    "category": "25ml Collection",
    "scentFamily": "Floral",
    "topNotes": [],
    "middleNotes": [],
    "baseNotes": [],
    "sizes": [
      {
        "ml": 25,
        "price": 35
      }
    ],
    "rating": 4.5,
    "reviewCount": 0,
    "imageGradient": [
      "#2D1B2E",
      "#8B4572"
    ],
    "imageUrl": "/products/img977.png",
    "featured": false
  },
  {
    "id": "68",
    "slug": "genie-collection-7002",
    "name": "GENIE COLLECTION",
    "brand": "Génie Collection",
    "tagline": "Luxury fragrance for the discerning",
    "description": "GENIE COLLECTION - A refined fragrance from the Génie Collection. Crafted with care for lasting elegance.",
    "price": 35,
    "category": "25ml Collection",
    "scentFamily": "Floral",
    "topNotes": [],
    "middleNotes": [],
    "baseNotes": [],
    "sizes": [
      {
        "ml": 25,
        "price": 35
      }
    ],
    "rating": 4.5,
    "reviewCount": 0,
    "imageGradient": [
      "#2D1B2E",
      "#8B4572"
    ],
    "imageUrl": "/products/img984.png",
    "featured": false
  },
  {
    "id": "69",
    "slug": "genie-collection-2002",
    "name": "GENIE COLLECTION",
    "brand": "Génie Collection",
    "tagline": "Luxury fragrance for the discerning",
    "description": "GENIE COLLECTION - A refined fragrance from the Génie Collection. Crafted with care for lasting elegance.",
    "price": 35,
    "category": "25ml Collection",
    "scentFamily": "Floral",
    "topNotes": [],
    "middleNotes": [],
    "baseNotes": [],
    "sizes": [
      {
        "ml": 25,
        "price": 35
      }
    ],
    "rating": 4.5,
    "reviewCount": 0,
    "imageGradient": [
      "#2D1B2E",
      "#8B4572"
    ],
    "imageUrl": "/products/img987.png",
    "featured": false
  },
  {
    "id": "70",
    "slug": "genie-collection-8881",
    "name": "GENIE COLLECTION",
    "brand": "Génie Collection",
    "tagline": "Luxury fragrance for the discerning",
    "description": "GENIE COLLECTION - A refined fragrance from the Génie Collection. Crafted with care for lasting elegance.",
    "price": 35,
    "category": "25ml Collection",
    "scentFamily": "Floral",
    "topNotes": [],
    "middleNotes": [],
    "baseNotes": [],
    "sizes": [
      {
        "ml": 25,
        "price": 35
      }
    ],
    "rating": 4.5,
    "reviewCount": 0,
    "imageGradient": [
      "#2D1B2E",
      "#8B4572"
    ],
    "imageUrl": "/products/img1000.png",
    "featured": false
  },
  {
    "id": "71",
    "slug": "genie-collection-5546",
    "name": "GENIE COLLECTION",
    "brand": "Génie Collection",
    "tagline": "Luxury fragrance for the discerning",
    "description": "GENIE COLLECTION - A refined fragrance from the Génie Collection. Crafted with care for lasting elegance.",
    "price": 35,
    "category": "25ml Collection",
    "scentFamily": "Floral",
    "topNotes": [],
    "middleNotes": [],
    "baseNotes": [],
    "sizes": [
      {
        "ml": 25,
        "price": 35
      }
    ],
    "rating": 4.5,
    "reviewCount": 0,
    "imageGradient": [
      "#2D1B2E",
      "#8B4572"
    ],
    "imageUrl": "/products/img1017.png",
    "featured": false
  },
  {
    "id": "72",
    "slug": "good-girl-superstars",
    "name": "GOOD GIRL SUPERSTARS",
    "brand": "Génie Collection",
    "tagline": "Luxury fragrance for the discerning",
    "description": "GOOD GIRL SUPERSTARS - A refined fragrance from the Génie Collection. Crafted with care for lasting elegance.",
    "price": 35,
    "category": "25ml Collection",
    "scentFamily": "Floral",
    "topNotes": [],
    "middleNotes": [],
    "baseNotes": [],
    "sizes": [
      {
        "ml": 25,
        "price": 35
      }
    ],
    "rating": 4.5,
    "reviewCount": 0,
    "imageGradient": [
      "#2D1B2E",
      "#8B4572"
    ],
    "imageUrl": "/products/img1021.png",
    "featured": false
  },
  {
    "id": "73",
    "slug": "genie-dream-8889",
    "name": "GENIE DREAM",
    "brand": "Génie Collection",
    "tagline": "Luxury fragrance for the discerning",
    "description": "GENIE DREAM - A refined fragrance from the Génie Collection. Crafted with care for lasting elegance.",
    "price": 35,
    "category": "25ml Collection",
    "scentFamily": "Floral",
    "topNotes": [],
    "middleNotes": [],
    "baseNotes": [],
    "sizes": [
      {
        "ml": 25,
        "price": 35
      }
    ],
    "rating": 4.5,
    "reviewCount": 0,
    "imageGradient": [
      "#2D1B2E",
      "#8B4572"
    ],
    "imageUrl": "/products/img1022.png",
    "featured": false
  },
  {
    "id": "74",
    "slug": "genie-collection-1021",
    "name": "GENIE COLLECTION",
    "brand": "Génie Collection",
    "tagline": "Luxury fragrance for the discerning",
    "description": "GENIE COLLECTION - A refined fragrance from the Génie Collection. Crafted with care for lasting elegance.",
    "price": 35,
    "category": "25ml Collection",
    "scentFamily": "Floral",
    "topNotes": [],
    "middleNotes": [],
    "baseNotes": [],
    "sizes": [
      {
        "ml": 25,
        "price": 35
      }
    ],
    "rating": 4.5,
    "reviewCount": 0,
    "imageGradient": [
      "#2D1B2E",
      "#8B4572"
    ],
    "imageUrl": "/products/img1023.png",
    "featured": false
  },
  {
    "id": "75",
    "slug": "genie-collection-8875",
    "name": "GENIE COLLECTION",
    "brand": "Génie Collection",
    "tagline": "Luxury fragrance for the discerning",
    "description": "GENIE COLLECTION - A refined fragrance from the Génie Collection. Crafted with care for lasting elegance.",
    "price": 35,
    "category": "25ml Collection",
    "scentFamily": "Floral",
    "topNotes": [],
    "middleNotes": [],
    "baseNotes": [],
    "sizes": [
      {
        "ml": 25,
        "price": 35
      }
    ],
    "rating": 4.5,
    "reviewCount": 0,
    "imageGradient": [
      "#2D1B2E",
      "#8B4572"
    ],
    "imageUrl": "/products/img1024.png",
    "featured": false
  },
  {
    "id": "76",
    "slug": "genie-collection-5529",
    "name": "GÉNIE COLLECTION",
    "brand": "Génie Collection",
    "tagline": "Luxury fragrance for the discerning",
    "description": "GÉNIE COLLECTION - A refined fragrance from the Génie Collection. Crafted with care for lasting elegance.",
    "price": 35,
    "category": "25ml Collection",
    "scentFamily": "Floral",
    "topNotes": [],
    "middleNotes": [],
    "baseNotes": [],
    "sizes": [
      {
        "ml": 25,
        "price": 35
      }
    ],
    "rating": 4.5,
    "reviewCount": 0,
    "imageGradient": [
      "#2D1B2E",
      "#8B4572"
    ],
    "imageUrl": "/products/img1033.png",
    "featured": false
  },
  {
    "id": "77",
    "slug": "genie-collection-015516",
    "name": "GÉNIE COLLECTION",
    "brand": "Génie Collection",
    "tagline": "Luxury fragrance for the discerning",
    "description": "GÉNIE COLLECTION - A refined fragrance from the Génie Collection. Crafted with care for lasting elegance.",
    "price": 35,
    "category": "25ml Collection",
    "scentFamily": "Floral",
    "topNotes": [],
    "middleNotes": [],
    "baseNotes": [],
    "sizes": [
      {
        "ml": 25,
        "price": 35
      }
    ],
    "rating": 4.5,
    "reviewCount": 0,
    "imageGradient": [
      "#2D1B2E",
      "#8B4572"
    ],
    "imageUrl": "/products/img1034.png",
    "featured": false
  },
  {
    "id": "78",
    "slug": "genie-collection-5527",
    "name": "GÉNIE COLLECTION",
    "brand": "Génie Collection",
    "tagline": "Luxury fragrance for the discerning",
    "description": "GÉNIE COLLECTION - A refined fragrance from the Génie Collection. Crafted with care for lasting elegance.",
    "price": 35,
    "category": "25ml Collection",
    "scentFamily": "Floral",
    "topNotes": [],
    "middleNotes": [],
    "baseNotes": [],
    "sizes": [
      {
        "ml": 25,
        "price": 35
      }
    ],
    "rating": 4.5,
    "reviewCount": 0,
    "imageGradient": [
      "#2D1B2E",
      "#8B4572"
    ],
    "imageUrl": "/products/img1035.png",
    "featured": false
  },
  {
    "id": "79",
    "slug": "my-wish-8914",
    "name": "MY WISH",
    "brand": "Génie Collection",
    "tagline": "Luxury fragrance for the discerning",
    "description": "MY WISH - A refined fragrance from the Génie Collection. Crafted with care for lasting elegance.",
    "price": 35,
    "category": "25ml Collection",
    "scentFamily": "Floral",
    "topNotes": [],
    "middleNotes": [],
    "baseNotes": [],
    "sizes": [
      {
        "ml": 25,
        "price": 35
      }
    ],
    "rating": 4.5,
    "reviewCount": 0,
    "imageGradient": [
      "#2D1B2E",
      "#8B4572"
    ],
    "imageUrl": "/products/img1036.png",
    "featured": false
  },
  {
    "id": "80",
    "slug": "genie-collection-ref-012206",
    "name": "GENIE COLLECTION",
    "brand": "Génie Collection",
    "tagline": "Luxury fragrance for the discerning",
    "description": "GENIE COLLECTION - A refined fragrance from the Génie Collection. Crafted with care for lasting elegance.",
    "price": 35,
    "category": "25ml Collection",
    "scentFamily": "Floral",
    "topNotes": [],
    "middleNotes": [],
    "baseNotes": [],
    "sizes": [
      {
        "ml": 25,
        "price": 35
      }
    ],
    "rating": 4.5,
    "reviewCount": 0,
    "imageGradient": [
      "#2D1B2E",
      "#8B4572"
    ],
    "imageUrl": "/products/img1037.png",
    "featured": false
  },
  {
    "id": "81",
    "slug": "my-way",
    "name": "MY WAY",
    "brand": "Génie Collection",
    "tagline": "Luxury fragrance for the discerning",
    "description": "MY WAY - A refined fragrance from the Génie Collection. Crafted with care for lasting elegance.",
    "price": 120,
    "category": "85ml Collection",
    "scentFamily": "Floral",
    "topNotes": [],
    "middleNotes": [],
    "baseNotes": [],
    "sizes": [
      {
        "ml": 85,
        "price": 120
      }
    ],
    "rating": 4.5,
    "reviewCount": 0,
    "imageGradient": [
      "#2D1B2E",
      "#8B4572"
    ],
    "imageUrl": "/products/img741.png",
    "featured": false
  },
  {
    "id": "82",
    "slug": "genie-collection",
    "name": "GÉNIE COLLECTION",
    "brand": "Génie Collection",
    "tagline": "Luxury fragrance for the discerning",
    "description": "GÉNIE COLLECTION - A refined fragrance from the Génie Collection. Crafted with care for lasting elegance.",
    "price": 120,
    "category": "85ml Collection",
    "scentFamily": "Floral",
    "topNotes": [],
    "middleNotes": [],
    "baseNotes": [],
    "sizes": [
      {
        "ml": 85,
        "price": 120
      }
    ],
    "rating": 4.5,
    "reviewCount": 0,
    "imageGradient": [
      "#2D1B2E",
      "#8B4572"
    ],
    "imageUrl": "/products/img742.png",
    "featured": false
  },
  {
    "id": "83",
    "slug": "olympetic-by-genie-collection",
    "name": "OLYMPETIC BY GÉNIE COLLECTION",
    "brand": "Génie Collection",
    "tagline": "Luxury fragrance for the discerning",
    "description": "OLYMPETIC BY GÉNIE COLLECTION - A refined fragrance from the Génie Collection. Crafted with care for lasting elegance.",
    "price": 120,
    "category": "85ml Collection",
    "scentFamily": "Floral",
    "topNotes": [],
    "middleNotes": [],
    "baseNotes": [],
    "sizes": [
      {
        "ml": 85,
        "price": 120
      }
    ],
    "rating": 4.5,
    "reviewCount": 0,
    "imageGradient": [
      "#2D1B2E",
      "#8B4572"
    ],
    "imageUrl": "/products/img743.png",
    "featured": false
  },
  {
    "id": "84",
    "slug": "good-girl-genie-collection",
    "name": "GOOD GIRL GÉNIE COLLECTION",
    "brand": "Génie Collection",
    "tagline": "Luxury fragrance for the discerning",
    "description": "GOOD GIRL GÉNIE COLLECTION - A refined fragrance from the Génie Collection. Crafted with care for lasting elegance.",
    "price": 120,
    "category": "85ml Collection",
    "scentFamily": "Floral",
    "topNotes": [],
    "middleNotes": [],
    "baseNotes": [],
    "sizes": [
      {
        "ml": 85,
        "price": 120
      }
    ],
    "rating": 4.5,
    "reviewCount": 0,
    "imageGradient": [
      "#2D1B2E",
      "#8B4572"
    ],
    "imageUrl": "/products/img744.png",
    "featured": false
  },
  {
    "id": "85",
    "slug": "chance-by-genie-collection-eau-tendre",
    "name": "CHANCE BY GÉNIE COLLECTION EAU TENDRE",
    "brand": "Génie Collection",
    "tagline": "Luxury fragrance for the discerning",
    "description": "CHANCE BY GÉNIE COLLECTION EAU TENDRE - A refined fragrance from the Génie Collection. Crafted with care for lasting elegance.",
    "price": 120,
    "category": "85ml Collection",
    "scentFamily": "Floral",
    "topNotes": [],
    "middleNotes": [],
    "baseNotes": [],
    "sizes": [
      {
        "ml": 85,
        "price": 120
      }
    ],
    "rating": 4.5,
    "reviewCount": 0,
    "imageGradient": [
      "#2D1B2E",
      "#8B4572"
    ],
    "imageUrl": "/products/img745.png",
    "featured": false
  },
  {
    "id": "86",
    "slug": "genie-collection-paradise",
    "name": "GÉNIE COLLECTION PARADISE",
    "brand": "Génie Collection",
    "tagline": "Luxury fragrance for the discerning",
    "description": "GÉNIE COLLECTION PARADISE - A refined fragrance from the Génie Collection. Crafted with care for lasting elegance.",
    "price": 120,
    "category": "85ml Collection",
    "scentFamily": "Floral",
    "topNotes": [],
    "middleNotes": [],
    "baseNotes": [],
    "sizes": [
      {
        "ml": 85,
        "price": 120
      }
    ],
    "rating": 4.5,
    "reviewCount": 0,
    "imageGradient": [
      "#2D1B2E",
      "#8B4572"
    ],
    "imageUrl": "/products/img746.png",
    "featured": false
  },
  {
    "id": "87",
    "slug": "genie-85",
    "name": "GÉNIE",
    "brand": "Génie Collection",
    "tagline": "Luxury fragrance for the discerning",
    "description": "GÉNIE - A refined fragrance from the Génie Collection. Crafted with care for lasting elegance.",
    "price": 120,
    "category": "85ml Collection",
    "scentFamily": "Floral",
    "topNotes": [],
    "middleNotes": [],
    "baseNotes": [],
    "sizes": [
      {
        "ml": 85,
        "price": 120
      }
    ],
    "rating": 4.5,
    "reviewCount": 0,
    "imageGradient": [
      "#2D1B2E",
      "#8B4572"
    ],
    "imageUrl": "/products/img747.png",
    "featured": false
  },
  {
    "id": "88",
    "slug": "idule-by-genie-collection",
    "name": "IDULE BY GÉNIE COLLECTION",
    "brand": "Génie Collection",
    "tagline": "Luxury fragrance for the discerning",
    "description": "IDULE BY GÉNIE COLLECTION - A refined fragrance from the Génie Collection. Crafted with care for lasting elegance.",
    "price": 120,
    "category": "85ml Collection",
    "scentFamily": "Floral",
    "topNotes": [],
    "middleNotes": [],
    "baseNotes": [],
    "sizes": [
      {
        "ml": 85,
        "price": 120
      }
    ],
    "rating": 4.5,
    "reviewCount": 0,
    "imageGradient": [
      "#2D1B2E",
      "#8B4572"
    ],
    "imageUrl": "/products/img748.png",
    "featured": false
  },
  {
    "id": "89",
    "slug": "miss-genie-blooming-bouquet",
    "name": "MISS GENIE BLOOMING BOUQUET",
    "brand": "Génie Collection",
    "tagline": "Luxury fragrance for the discerning",
    "description": "MISS GENIE BLOOMING BOUQUET - A refined fragrance from the Génie Collection. Crafted with care for lasting elegance.",
    "price": 120,
    "category": "85ml Collection",
    "scentFamily": "Floral",
    "topNotes": [],
    "middleNotes": [],
    "baseNotes": [],
    "sizes": [
      {
        "ml": 85,
        "price": 120
      }
    ],
    "rating": 4.5,
    "reviewCount": 0,
    "imageGradient": [
      "#2D1B2E",
      "#8B4572"
    ],
    "imageUrl": "/products/img753.png",
    "featured": false
  },
  {
    "id": "90",
    "slug": "black-opum-by-genie",
    "name": "BLACK OPUM BY GÉNIE",
    "brand": "Génie Collection",
    "tagline": "Luxury fragrance for the discerning",
    "description": "BLACK OPUM BY GÉNIE - A refined fragrance from the Génie Collection. Crafted with care for lasting elegance.",
    "price": 120,
    "category": "85ml Collection",
    "scentFamily": "Floral",
    "topNotes": [],
    "middleNotes": [],
    "baseNotes": [],
    "sizes": [
      {
        "ml": 85,
        "price": 120
      }
    ],
    "rating": 4.5,
    "reviewCount": 0,
    "imageGradient": [
      "#2D1B2E",
      "#8B4572"
    ],
    "imageUrl": "/products/img754.png",
    "featured": false
  },
  {
    "id": "91",
    "slug": "boucheros-by-genie",
    "name": "BOUCHEROS BY GÉNIE",
    "brand": "Génie Collection",
    "tagline": "Luxury fragrance for the discerning",
    "description": "BOUCHEROS BY GÉNIE - A refined fragrance from the Génie Collection. Crafted with care for lasting elegance.",
    "price": 120,
    "category": "85ml Collection",
    "scentFamily": "Floral",
    "topNotes": [],
    "middleNotes": [],
    "baseNotes": [],
    "sizes": [
      {
        "ml": 85,
        "price": 120
      }
    ],
    "rating": 4.5,
    "reviewCount": 0,
    "imageGradient": [
      "#2D1B2E",
      "#8B4572"
    ],
    "imageUrl": "/products/img756.png",
    "featured": false
  },
  {
    "id": "92",
    "slug": "si-passion",
    "name": "SI PASSION",
    "brand": "Génie Collection",
    "tagline": "Luxury fragrance for the discerning",
    "description": "SI PASSION - A refined fragrance from the Génie Collection. Crafted with care for lasting elegance.",
    "price": 120,
    "category": "85ml Collection",
    "scentFamily": "Floral",
    "topNotes": [],
    "middleNotes": [],
    "baseNotes": [],
    "sizes": [
      {
        "ml": 85,
        "price": 120
      }
    ],
    "rating": 4.5,
    "reviewCount": 0,
    "imageGradient": [
      "#2D1B2E",
      "#8B4572"
    ],
    "imageUrl": "/products/img757.png",
    "featured": false
  },
  {
    "id": "93",
    "slug": "gc-mademoiselle-genie-collection",
    "name": "GC MADEMOISELLE GÉNIE COLLECTION",
    "brand": "Génie Collection",
    "tagline": "Luxury fragrance for the discerning",
    "description": "GC MADEMOISELLE GÉNIE COLLECTION - A refined fragrance from the Génie Collection. Crafted with care for lasting elegance.",
    "price": 120,
    "category": "85ml Collection",
    "scentFamily": "Floral",
    "topNotes": [],
    "middleNotes": [],
    "baseNotes": [],
    "sizes": [
      {
        "ml": 85,
        "price": 120
      }
    ],
    "rating": 4.5,
    "reviewCount": 0,
    "imageGradient": [
      "#2D1B2E",
      "#8B4572"
    ],
    "imageUrl": "/products/img765.png",
    "featured": false
  },
  {
    "id": "94",
    "slug": "genie-crystal-noir",
    "name": "GÉNIE CRYSTAL NOIR",
    "brand": "Génie Collection",
    "tagline": "Luxury fragrance for the discerning",
    "description": "GÉNIE CRYSTAL NOIR - A refined fragrance from the Génie Collection. Crafted with care for lasting elegance.",
    "price": 120,
    "category": "85ml Collection",
    "scentFamily": "Floral",
    "topNotes": [],
    "middleNotes": [],
    "baseNotes": [],
    "sizes": [
      {
        "ml": 85,
        "price": 120
      }
    ],
    "rating": 4.5,
    "reviewCount": 0,
    "imageGradient": [
      "#2D1B2E",
      "#8B4572"
    ],
    "imageUrl": "/products/img766.png",
    "featured": false
  },
  {
    "id": "95",
    "slug": "genie-flora-collection",
    "name": "GÉNIE FLORA COLLECTION",
    "brand": "Génie Collection",
    "tagline": "Luxury fragrance for the discerning",
    "description": "GÉNIE FLORA COLLECTION - A refined fragrance from the Génie Collection. Crafted with care for lasting elegance.",
    "price": 120,
    "category": "85ml Collection",
    "scentFamily": "Floral",
    "topNotes": [],
    "middleNotes": [],
    "baseNotes": [],
    "sizes": [
      {
        "ml": 85,
        "price": 120
      }
    ],
    "rating": 4.5,
    "reviewCount": 0,
    "imageGradient": [
      "#2D1B2E",
      "#8B4572"
    ],
    "imageUrl": "/products/img767.png",
    "featured": false
  },
  {
    "id": "96",
    "slug": "marly-by-genie-collection-delina",
    "name": "MARLY BY GÉNIE COLLECTION DELINA",
    "brand": "Génie Collection",
    "tagline": "Luxury fragrance for the discerning",
    "description": "MARLY BY GÉNIE COLLECTION DELINA - A refined fragrance from the Génie Collection. Crafted with care for lasting elegance.",
    "price": 120,
    "category": "85ml Collection",
    "scentFamily": "Floral",
    "topNotes": [],
    "middleNotes": [],
    "baseNotes": [],
    "sizes": [
      {
        "ml": 85,
        "price": 120
      }
    ],
    "rating": 4.5,
    "reviewCount": 0,
    "imageGradient": [
      "#2D1B2E",
      "#8B4572"
    ],
    "imageUrl": "/products/img768.png",
    "featured": false
  },
  {
    "id": "97",
    "slug": "genie-eau-de-parfum-85",
    "name": "GÉNIE EAU DE PARFUM",
    "brand": "Génie Collection",
    "tagline": "Luxury fragrance for the discerning",
    "description": "GÉNIE EAU DE PARFUM - A refined fragrance from the Génie Collection. Crafted with care for lasting elegance.",
    "price": 120,
    "category": "85ml Collection",
    "scentFamily": "Floral",
    "topNotes": [],
    "middleNotes": [],
    "baseNotes": [],
    "sizes": [
      {
        "ml": 85,
        "price": 120
      }
    ],
    "rating": 4.5,
    "reviewCount": 0,
    "imageGradient": [
      "#2D1B2E",
      "#8B4572"
    ],
    "imageUrl": "/products/img769.png",
    "featured": false
  },
  {
    "id": "98",
    "slug": "genie-bright-crystal",
    "name": "GÉNIE BRIGHT CRYSTAL",
    "brand": "Génie Collection",
    "tagline": "Luxury fragrance for the discerning",
    "description": "GÉNIE BRIGHT CRYSTAL - A refined fragrance from the Génie Collection. Crafted with care for lasting elegance.",
    "price": 120,
    "category": "85ml Collection",
    "scentFamily": "Floral",
    "topNotes": [],
    "middleNotes": [],
    "baseNotes": [],
    "sizes": [
      {
        "ml": 85,
        "price": 120
      }
    ],
    "rating": 4.5,
    "reviewCount": 0,
    "imageGradient": [
      "#2D1B2E",
      "#8B4572"
    ],
    "imageUrl": "/products/img770.png",
    "featured": false
  },
  {
    "id": "99",
    "slug": "genie-collection-intense",
    "name": "GÉNIE COLLECTION INTENSE",
    "brand": "Génie Collection",
    "tagline": "Luxury fragrance for the discerning",
    "description": "GÉNIE COLLECTION INTENSE - A refined fragrance from the Génie Collection. Crafted with care for lasting elegance.",
    "price": 120,
    "category": "85ml Collection",
    "scentFamily": "Floral",
    "topNotes": [],
    "middleNotes": [],
    "baseNotes": [],
    "sizes": [
      {
        "ml": 85,
        "price": 120
      }
    ],
    "rating": 4.5,
    "reviewCount": 0,
    "imageGradient": [
      "#2D1B2E",
      "#8B4572"
    ],
    "imageUrl": "/products/img772.png",
    "featured": false
  },
  {
    "id": "100",
    "slug": "higo-201020",
    "name": "HIGO",
    "brand": "Génie Collection",
    "tagline": "Luxury fragrance for the discerning",
    "description": "HIGO - A refined fragrance from the Génie Collection. Crafted with care for lasting elegance.",
    "price": 120,
    "category": "85ml Collection",
    "scentFamily": "Floral",
    "topNotes": [],
    "middleNotes": [],
    "baseNotes": [],
    "sizes": [
      {
        "ml": 85,
        "price": 120
      }
    ],
    "rating": 4.5,
    "reviewCount": 0,
    "imageGradient": [
      "#2D1B2E",
      "#8B4572"
    ],
    "imageUrl": "/products/img784.png",
    "featured": false
  },
  {
    "id": "101",
    "slug": "1-billion-genie-collection",
    "name": "1 BILLION GENIE COLLECTION",
    "brand": "Génie Collection",
    "tagline": "Luxury fragrance for the discerning",
    "description": "1 BILLION GENIE COLLECTION - A refined fragrance from the Génie Collection. Crafted with care for lasting elegance.",
    "price": 120,
    "category": "85ml Collection",
    "scentFamily": "Floral",
    "topNotes": [],
    "middleNotes": [],
    "baseNotes": [],
    "sizes": [
      {
        "ml": 85,
        "price": 120
      }
    ],
    "rating": 4.5,
    "reviewCount": 0,
    "imageGradient": [
      "#2D1B2E",
      "#8B4572"
    ],
    "imageUrl": "/products/img785.png",
    "featured": false
  },
  {
    "id": "102",
    "slug": "invistus",
    "name": "INVISTUS",
    "brand": "Génie Collection",
    "tagline": "Luxury fragrance for the discerning",
    "description": "INVISTUS - A refined fragrance from the Génie Collection. Crafted with care for lasting elegance.",
    "price": 120,
    "category": "85ml Collection",
    "scentFamily": "Floral",
    "topNotes": [],
    "middleNotes": [],
    "baseNotes": [],
    "sizes": [
      {
        "ml": 85,
        "price": 120
      }
    ],
    "rating": 4.5,
    "reviewCount": 0,
    "imageGradient": [
      "#2D1B2E",
      "#8B4572"
    ],
    "imageUrl": "/products/img786.png",
    "featured": false
  },
  {
    "id": "103",
    "slug": "stronger-with-gc-genie-collection",
    "name": "STRONGER WITH GC GÉNIE COLLECTION",
    "brand": "Génie Collection",
    "tagline": "Luxury fragrance for the discerning",
    "description": "STRONGER WITH GC GÉNIE COLLECTION - A refined fragrance from the Génie Collection. Crafted with care for lasting elegance.",
    "price": 120,
    "category": "85ml Collection",
    "scentFamily": "Floral",
    "topNotes": [],
    "middleNotes": [],
    "baseNotes": [],
    "sizes": [
      {
        "ml": 85,
        "price": 120
      }
    ],
    "rating": 4.5,
    "reviewCount": 0,
    "imageGradient": [
      "#2D1B2E",
      "#8B4572"
    ],
    "imageUrl": "/products/img787.png",
    "featured": false
  },
  {
    "id": "104",
    "slug": "marly-by-genie-pegasus-royal-essence",
    "name": "MARLY BY GENIE PEGASUS ROYAL ESSENCE",
    "brand": "Génie Collection",
    "tagline": "Luxury fragrance for the discerning",
    "description": "MARLY BY GENIE PEGASUS ROYAL ESSENCE - A refined fragrance from the Génie Collection. Crafted with care for lasting elegance.",
    "price": 120,
    "category": "85ml Collection",
    "scentFamily": "Floral",
    "topNotes": [],
    "middleNotes": [],
    "baseNotes": [],
    "sizes": [
      {
        "ml": 85,
        "price": 120
      }
    ],
    "rating": 4.5,
    "reviewCount": 0,
    "imageGradient": [
      "#2D1B2E",
      "#8B4572"
    ],
    "imageUrl": "/products/img788.png",
    "featured": false
  },
  {
    "id": "105",
    "slug": "genie-collection-pi",
    "name": "GÉNIE COLLECTION π",
    "brand": "Génie Collection",
    "tagline": "Luxury fragrance for the discerning",
    "description": "GÉNIE COLLECTION π - A refined fragrance from the Génie Collection. Crafted with care for lasting elegance.",
    "price": 120,
    "category": "85ml Collection",
    "scentFamily": "Floral",
    "topNotes": [],
    "middleNotes": [],
    "baseNotes": [],
    "sizes": [
      {
        "ml": 85,
        "price": 120
      }
    ],
    "rating": 4.5,
    "reviewCount": 0,
    "imageGradient": [
      "#2D1B2E",
      "#8B4572"
    ],
    "imageUrl": "/products/img794.png",
    "featured": false
  },
  {
    "id": "106",
    "slug": "genie-homme-intense",
    "name": "GÉNIE HOMME INTENSE",
    "brand": "Génie Collection",
    "tagline": "Luxury fragrance for the discerning",
    "description": "GÉNIE HOMME INTENSE - A refined fragrance from the Génie Collection. Crafted with care for lasting elegance.",
    "price": 120,
    "category": "85ml Collection",
    "scentFamily": "Floral",
    "topNotes": [],
    "middleNotes": [],
    "baseNotes": [],
    "sizes": [
      {
        "ml": 85,
        "price": 120
      }
    ],
    "rating": 4.5,
    "reviewCount": 0,
    "imageGradient": [
      "#2D1B2E",
      "#8B4572"
    ],
    "imageUrl": "/products/img795.png",
    "featured": false
  },
  {
    "id": "107",
    "slug": "versage-genie-collection",
    "name": "VERSAGE GENIE COLLECTION",
    "brand": "Génie Collection",
    "tagline": "Luxury fragrance for the discerning",
    "description": "VERSAGE GENIE COLLECTION - A refined fragrance from the Génie Collection. Crafted with care for lasting elegance.",
    "price": 120,
    "category": "85ml Collection",
    "scentFamily": "Floral",
    "topNotes": [],
    "middleNotes": [],
    "baseNotes": [],
    "sizes": [
      {
        "ml": 85,
        "price": 120
      }
    ],
    "rating": 4.5,
    "reviewCount": 0,
    "imageGradient": [
      "#2D1B2E",
      "#8B4572"
    ],
    "imageUrl": "/products/img796.png",
    "featured": false
  },
  {
    "id": "108",
    "slug": "acqua-di-glo-genie-collection-profondo",
    "name": "ACQUA DI GLÒ GENIE COLLECTION PROFONDO",
    "brand": "Génie Collection",
    "tagline": "Luxury fragrance for the discerning",
    "description": "ACQUA DI GLÒ GENIE COLLECTION PROFONDO - A refined fragrance from the Génie Collection. Crafted with care for lasting elegance.",
    "price": 120,
    "category": "85ml Collection",
    "scentFamily": "Floral",
    "topNotes": [],
    "middleNotes": [],
    "baseNotes": [],
    "sizes": [
      {
        "ml": 85,
        "price": 120
      }
    ],
    "rating": 4.5,
    "reviewCount": 0,
    "imageGradient": [
      "#2D1B2E",
      "#8B4572"
    ],
    "imageUrl": "/products/img797.png",
    "featured": false
  },
  {
    "id": "109",
    "slug": "genie-collection-leader",
    "name": "GÉNIE COLLECTION LEADER",
    "brand": "Génie Collection",
    "tagline": "Luxury fragrance for the discerning",
    "description": "GÉNIE COLLECTION LEADER - A refined fragrance from the Génie Collection. Crafted with care for lasting elegance.",
    "price": 120,
    "category": "85ml Collection",
    "scentFamily": "Floral",
    "topNotes": [],
    "middleNotes": [],
    "baseNotes": [],
    "sizes": [
      {
        "ml": 85,
        "price": 120
      }
    ],
    "rating": 4.5,
    "reviewCount": 0,
    "imageGradient": [
      "#2D1B2E",
      "#8B4572"
    ],
    "imageUrl": "/products/img798.png",
    "featured": false
  }
]

export const categories = ["25ml Collection", "85ml Collection"] as const
export const scentFamilies = ["Floral", "Woody", "Oriental", "Fresh", "Citrus"] as const

export function getProductBySlug(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug)
}

export function getFeaturedProducts(): Product[] {
  return products.filter((p) => p.featured)
}

export function getRelatedProducts(product: Product, limit = 4): Product[] {
  return products
    .filter((p) => p.id !== product.id && (p.scentFamily === product.scentFamily || p.category === product.category))
    .slice(0, limit)
}

export const mockReviews = [
  { id: "r1", author: "Isabelle M.", rating: 5, date: "2025-11-15", title: "Absolutely divine", text: "This is the most beautiful fragrance I have ever worn. The sillage is incredible and I receive compliments everywhere I go. Worth every penny." },
  { id: "r2", author: "Thomas K.", rating: 4, date: "2025-10-22", title: "Elegant and long-lasting", text: "A sophisticated scent that lasts all day. The dry down is particularly beautiful. Only reason for 4 stars is I wish the opening was slightly less sharp." },
  { id: "r3", author: "Sophie L.", rating: 5, date: "2025-09-30", title: "My signature scent", text: "I've been searching for my signature scent for years, and this is it. Complex, intriguing, and uniquely me. The packaging is also exquisite." },
  { id: "r4", author: "Marcus R.", rating: 5, date: "2025-08-17", title: "A masterpiece", text: "The blend of notes is masterfully done. Each phase of the fragrance reveals something new. This is perfumery at its finest." },
]
