// Dialog form used to create or edit products, including optional stock movements
import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { api, Product, Movement } from '@/lib/api';
import { toast } from 'sonner';
import { Plus, Trash2 } from 'lucide-react';

interface ProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: Product | null;
  onSuccess: () => void;
  existingCategories: string[];
}

// ProductDialog component: controlled modal form for product CRUD
export function ProductDialog({ open, onOpenChange, product, onSuccess, existingCategories }: ProductDialogProps) {
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    category: '',
    supplier: '',
    price: '',
    reorder_level: '',
    in_stock: '',
    description: '',
    is_active: true,
    image_url: '',
  });
  const [movements, setMovements] = useState<Movement[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [customCategory, setCustomCategory] = useState('');

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        sku: product.sku,
        category: product.category,
        supplier: product.supplier,
        price: product.price.toString(),
        reorder_level: product.reorder_level.toString(),
        in_stock: product.in_stock.toString(),
        description: product.description,
        is_active: product.is_active,
        image_url: product.image_url || '',
      });
      setMovements(product.movements || []);
      setCustomCategory('');
    } else {
      setFormData({
        name: '',
        sku: '',
        category: '',
        supplier: '',
        price: '',
        reorder_level: '',
        in_stock: '',
        description: '',
        is_active: true,
        image_url: '',
      });
      setMovements([]);
      setCustomCategory('');
    }
  }, [product, open]);

  const addMovement = () => {
    setMovements([
      ...movements,
      {
        movement_date: new Date().toISOString().split('T')[0],
        type: 'IN',
        quantity: 0,
      },
    ]);
  };

  const removeMovement = (index: number) => {
    setMovements(movements.filter((_, i) => i !== index));
  };

  const updateMovement = (index: number, field: keyof Movement, value: any) => {
    const updated = [...movements];
    updated[index] = { ...updated[index], [field]: value };
    setMovements(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const finalCategory = formData.category === 'custom' ? customCategory : formData.category;
      
      if (!finalCategory) {
        toast.error('Please select or enter a category');
        setIsLoading(false);
        return;
      }

      if (product) {
        // When editing, only send editable fields
        await api.updateProduct(product.id, {
          name: formData.name,
          category: finalCategory,
          supplier: formData.supplier,
          price: parseFloat(formData.price),
          reorder_level: parseInt(formData.reorder_level),
          in_stock: parseInt(formData.in_stock),
          description: formData.description,
          is_active: formData.is_active,
        });
        toast.success('Product updated successfully');
      } else {
        // When creating, include all fields
        await api.createProduct({
          name: formData.name,
          sku: formData.sku,
          category: finalCategory,
          supplier: formData.supplier,
          price: parseFloat(formData.price),
          reorder_level: parseInt(formData.reorder_level),
          in_stock: parseInt(formData.in_stock),
          description: formData.description,
          is_active: formData.is_active,
          ...(formData.image_url && { image_url: formData.image_url }),
          ...(movements.length > 0 && { movements }),
        });
        toast.success('Product created successfully');
      }

      onSuccess();
      onOpenChange(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to save product');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{product ? 'Edit Product' : 'Add New Product'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className={`grid ${product ? 'grid-cols-1' : 'grid-cols-2'} gap-4`}>
            <div className="space-y-2">
              <Label htmlFor="name">Product Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            {!product && (
              <div className="space-y-2">
                <Label htmlFor="sku">SKU *</Label>
                <Input
                  id="sku"
                  value={formData.sku}
                  onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                  required
                />
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger id="category">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent className="bg-popover z-50">
                  {existingCategories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                  <SelectItem value="custom">+ Add New Category</SelectItem>
                </SelectContent>
              </Select>
              {formData.category === 'custom' && (
                <Input
                  placeholder="Enter new category"
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                  className="mt-2"
                  required
                />
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="supplier">Supplier *</Label>
              <Input
                id="supplier"
                value={formData.supplier}
                onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Price *</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="in_stock">In Stock *</Label>
              <Input
                id="in_stock"
                type="number"
                value={formData.in_stock}
                onChange={(e) => setFormData({ ...formData, in_stock: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reorder_level">Reorder Level *</Label>
              <Input
                id="reorder_level"
                type="number"
                value={formData.reorder_level}
                onChange={(e) => setFormData({ ...formData, reorder_level: e.target.value })}
                required
              />
            </div>
          </div>

          {!product && (
            <div className="space-y-2">
              <Label htmlFor="image_url">Image URL (optional)</Label>
              <Input
                id="image_url"
                type="url"
                placeholder="https://example.com/image.jpg"
                value={formData.image_url}
                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
              rows={3}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="is_active"
              checked={formData.is_active}
              onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
            />
            <Label htmlFor="is_active">Active Product</Label>
          </div>

          {/* Stock Movements Section - Only show when creating */}
          {!product && (
            <div className="space-y-4 border-t pt-4">
              <div className="flex items-center justify-between">
                <Label className="text-base font-semibold">Stock Movements (Optional)</Label>
                <Button type="button" onClick={addMovement} size="sm" variant="outline">
                  <Plus className="h-4 w-4 mr-1" />
                  Add Movement
                </Button>
              </div>

              {movements.length > 0 && (
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {movements.map((movement, index) => (
                    <div key={index} className="grid grid-cols-12 gap-2 items-end p-3 border rounded-lg bg-muted/30">
                      <div className="col-span-3 space-y-1">
                        <Label className="text-xs">Date</Label>
                        <Input
                          type="date"
                          value={movement.movement_date}
                          onChange={(e) => updateMovement(index, 'movement_date', e.target.value)}
                          required
                        />
                      </div>
                      <div className="col-span-2 space-y-1">
                        <Label className="text-xs">Type</Label>
                        <Select
                          value={movement.type}
                          onValueChange={(value) => updateMovement(index, 'type', value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-popover z-50">
                            <SelectItem value="IN">IN</SelectItem>
                            <SelectItem value="OUT">OUT</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="col-span-2 space-y-1">
                        <Label className="text-xs">Quantity</Label>
                        <Input
                          type="number"
                          value={movement.quantity}
                          onChange={(e) => updateMovement(index, 'quantity', parseInt(e.target.value))}
                          required
                        />
                      </div>
                      <div className="col-span-2 space-y-1">
                        <Label className="text-xs">Unit Cost</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={movement.unit_cost || ''}
                          onChange={(e) => updateMovement(index, 'unit_cost', e.target.value ? parseFloat(e.target.value) : null)}
                          placeholder="Optional"
                        />
                      </div>
                      <div className="col-span-2 space-y-1">
                        <Label className="text-xs">Note</Label>
                        <Input
                          value={movement.note || ''}
                          onChange={(e) => updateMovement(index, 'note', e.target.value)}
                          placeholder="Optional"
                        />
                      </div>
                      <div className="col-span-1">
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={() => removeMovement(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : product ? 'Update Product' : 'Create Product'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
