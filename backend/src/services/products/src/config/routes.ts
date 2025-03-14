import { FastifySchema } from 'fastify'
import checksController from '../controllers/checkController'
import productsController from '../controllers/productsController'
import {
  getproductbyname,
  getproducts,
  initiateProductChange,
  productSchema,
  upschema,
} from '../schema/products'
import MaterialsController from '../controllers/MaterialController'
import {
  deleteMaterialSp,
  deleteproductschema,
  getmaterialspecific,
  getmaterialsspecific,
  materialschema,
  materialupdateschema,
} from '../schema/materials'

interface ProductRoutes {
  method: string
  routeName: string
  controller: (req: any, res: any) => Promise<void>
  schema?: any
}

interface RouteGroup {
  [key: string]: ProductRoutes
}

const routes: Record<string, RouteGroup> = {
  product_Routes: {
    InitiateProductModify: {
      method: 'POST',
      routeName: '/initiate_product',
      controller: productsController.ProductModify,
      schema: initiateProductChange,
    },
    productCreate: {
      method: 'POST',
      routeName: '/create-product',
      controller: productsController.CreateProduct,
      schema: productSchema,
    },
    getProduct: {
      method: 'POST',
      routeName: '/get-product',
      controller: productsController.GetProduct,
      schema: getproductbyname,
    },
    getProducts: {
      method: 'POST',
      routeName: '/get-products',
      controller: productsController.GetProducts,
      schema: getproducts,
    },
    deleteProduct: {
      method: 'POST',
      routeName: '/delete-product',
      controller: productsController.DeleteProduct,
      schema: deleteproductschema,
    },
    dashboard: {
      method: 'POST',
      routeName: '/dashboard',
      controller: productsController.Dashboard,
    },
    updateProduct: {
      method: 'POST',
      routeName: '/update-product',
      controller: productsController.updateProduct,
      schema: upschema,
    },
  },
  material_routes: {
    InitiateMatModify: {
      method: 'POST',
      routeName: '/initiate_material',
      controller: MaterialsController.BomModify,
      schema: initiateProductChange,
    },
    MatCreate: {
      method: 'POST',
      routeName: '/create-material',
      controller: MaterialsController.CreateBom,
      schema: materialschema,
    },
    UpdateMaterial: {
      method: 'POST',
      routeName: '/update-bom',
      controller: MaterialsController.UpdateBom,
      schema: materialupdateschema,
    },
    GetMaterial: {
      method: 'POST',
      routeName: '/get-material',
      controller: MaterialsController.GetMaterial,
      schema: getmaterialspecific,
    },
    GetMaterials: {
      method: 'POST',
      routeName: '/get-materials',
      controller: MaterialsController.GetMaterials,
      schema: getmaterialsspecific,
    },
    DeleteMaterial: {
      method: 'POST',
      routeName: '/delete-material',
      controller: MaterialsController.DeleteMaterial,
      schema: deleteMaterialSp,
    },
  },
  healthRoutes: {
    healthCheck: {
      method: 'GET',
      routeName: '/health',
      controller: checksController.healthcheck,
    },
    indexCheck: {
      method: 'GET',
      routeName: '/',
      controller: checksController.healthcheck, // todo add metrics
    },
  },
  userRoute: null, // todo may not need it, vad pe viitor
}
export default routes
