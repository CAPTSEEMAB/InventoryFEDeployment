import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Product } from '@/lib/api';
import { format } from 'date-fns';
import { ArrowDownCircle, ArrowUpCircle } from 'lucide-react';

interface ProductDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: Product | null;
}

export function ProductDetailDialog({ open, onOpenChange, product }: ProductDetailDialogProps) {
  if (!product) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Product Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {product.image_url && (
            <div className="aspect-video w-full overflow-hidden rounded-lg border">
              <img
                src={product.image_url}
                alt={product.name}
                className="h-full w-full object-cover"
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm font-medium text-muted-foreground">Product Name</div>
              <div className="text-lg font-semibold">{product.name}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-muted-foreground">SKU</div>
              <div className="font-mono">{product.sku}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-muted-foreground">Category</div>
              <div>{product.category}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-muted-foreground">Supplier</div>
              <div>{product.supplier}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-muted-foreground">Price</div>
              <div className="text-lg font-semibold">${product.price.toFixed(2)}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-muted-foreground">Current Stock</div>
              <div className="text-lg font-semibold">{product.in_stock}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-muted-foreground">Reorder Level</div>
              <div>{product.reorder_level}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-muted-foreground">Status</div>
              <span
                className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                  product.is_active
                    ? 'bg-success/10 text-success'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {product.is_active ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>

          <div>
            <div className="text-sm font-medium text-muted-foreground mb-1">Description</div>
            <div className="text-sm">{product.description}</div>
          </div>

          {product.movements && product.movements.length > 0 && (
            <div>
              <div className="text-sm font-medium text-muted-foreground mb-3">
                Stock Movements
              </div>
              <div className="space-y-2">
                {product.movements.map((movement, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between rounded-md border p-3"
                  >
                    <div className="flex items-center gap-3">
                      {movement.type === 'IN' ? (
                        <ArrowDownCircle className="h-5 w-5 text-success" />
                      ) : (
                        <ArrowUpCircle className="h-5 w-5 text-destructive" />
                      )}
                      <div>
                        <div className="font-medium">
                          {movement.type === 'IN' ? 'Stock In' : 'Stock Out'}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {format(new Date(movement.movement_date), 'MMM dd, yyyy')}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">
                        {movement.type === 'IN' ? '+' : '-'}
                        {movement.quantity}
                      </div>
                      {movement.unit_cost && (
                        <div className="text-sm text-muted-foreground">
                          ${movement.unit_cost.toFixed(2)}/unit
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-muted-foreground">Created</div>
              <div>{format(new Date(product.created_at), 'MMM dd, yyyy HH:mm')}</div>
            </div>
            <div>
              <div className="text-muted-foreground">Last Updated</div>
              <div>{format(new Date(product.updated_at), 'MMM dd, yyyy HH:mm')}</div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
