// Products page: list, search, create, edit and delete products
import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { api, Product } from '@/lib/api';
import { Plus, Search, Pencil, Trash2, Eye, Package } from 'lucide-react';
import { ProductDialog } from '@/components/ProductDialog';
import { ProductDetailDialog } from '@/components/ProductDetailDialog';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

// Products component: manages product table, dialogs and CRUD actions
export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    const filtered = products.filter(
      (product) =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.category.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredProducts(filtered);
  }, [searchQuery, products]);

  const categories = Array.from(new Set(products.map((p) => p.category))).filter(Boolean);

  const loadProducts = async () => {
    try {
      const response = await api.getProducts();
      setProducts(response.data);
      setFilteredProducts(response.data);
    } catch (error) {
      toast.error('Failed to load products');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (product: Product) => {
    setSelectedProduct(product);
    setIsDialogOpen(true);
  };

  const handleView = async (product: Product) => {
    try {
      const response = await api.getProduct(product.id);
      setSelectedProduct(response.data);
      setIsDetailDialogOpen(true);
    } catch (error) {
      toast.error('Failed to load product details');
    }
  };

  const handleDelete = async () => {
    if (!productToDelete) return;

    try {
      await api.deleteProduct(productToDelete.id);
      toast.success('Product deleted successfully');
      loadProducts();
      setDeleteDialogOpen(false);
      setProductToDelete(null);
    } catch (error) {
      toast.error('Failed to delete product');
    }
  };

  const openDeleteDialog = (product: Product) => {
    setProductToDelete(product);
    setDeleteDialogOpen(true);
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md w-full">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by name, SKU, or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-11"
            />
          </div>
          <Button
            onClick={() => {
              setSelectedProduct(null);
              setIsDialogOpen(true);
            }}
            className="w-full sm:w-auto"
            size="lg"
          >
            <Plus className="mr-2 h-5 w-5" />
            Add Product
          </Button>
        </div>

        <div className="rounded-xl border-0 shadow-medium bg-card overflow-hidden animate-fade-in">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/30">
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    SKU
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Name
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Category
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Supplier
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Price
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Stock
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Status
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center text-muted-foreground">
                      <div className="flex flex-col items-center gap-2">
                        <Package className="h-12 w-12 text-muted-foreground/30 mb-2" />
                        <p className="text-lg font-medium">No products found</p>
                        <p className="text-sm">Try adjusting your search</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((product, index) => (
                    <tr
                      key={product.id}
                      className="border-b last:border-0 hover:bg-muted/30 transition-colors animate-fade-in"
                      style={{ animationDelay: `${index * 30}ms` }}
                    >
                      <td className="px-6 py-4 text-sm font-mono text-muted-foreground">{product.sku}</td>
                      <td className="px-6 py-4 text-sm font-semibold">{product.name}</td>
                      <td className="px-6 py-4 text-sm">{product.category}</td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">{product.supplier}</td>
                      <td className="px-6 py-4 text-right text-sm font-semibold text-primary">
                        ${product.price.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-right text-sm">
                        <span
                          className={`font-semibold ${
                            product.in_stock <= product.reorder_level ? 'text-destructive' : 'text-success'
                          }`}
                        >
                          {product.in_stock}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center text-sm">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                            product.is_active ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'
                          }`}
                        >
                          {product.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="sm" onClick={() => handleView(product)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleEdit(product)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => openDeleteDialog(product)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <ProductDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        product={selectedProduct}
        onSuccess={loadProducts}
        existingCategories={categories}
      />

      <ProductDetailDialog
        open={isDetailDialogOpen}
        onOpenChange={setIsDetailDialogOpen}
        product={selectedProduct}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Product</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{productToDelete?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}
