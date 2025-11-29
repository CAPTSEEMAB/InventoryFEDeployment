import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { api, Product } from '@/lib/api';
import { Package, TrendingUp, AlertCircle, CheckCircle, ArrowUpRight, DollarSign } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function Dashboard() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const response = await api.getProducts();
      setProducts(response.data);
    } catch (error) {
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  };

  const totalProducts = products.length;
  const activeProducts = products.filter((p) => p.is_active).length;
  const lowStockProducts = products.filter((p) => p.in_stock <= p.reorder_level).length;
  
  // Dynamic calculation: Total inventory value (price × quantity for all products)
  const totalValue = products.reduce((sum, p) => sum + (p.price * p.in_stock), 0);

  // Chart data: Stock by Category
  const categoryData = products.reduce((acc, p) => {
    const existing = acc.find(item => item.category === p.category);
    if (existing) {
      existing.stock += p.in_stock;
      existing.value += p.price * p.in_stock;
    } else {
      acc.push({ 
        category: p.category, 
        stock: p.in_stock,
        value: p.price * p.in_stock 
      });
    }
    return acc;
  }, [] as { category: string; stock: number; value: number }[]);

  // Chart data: Stock Status Distribution
  const stockStatusData = [
    { name: 'In Stock', value: products.filter(p => p.in_stock > p.reorder_level).length, color: 'hsl(var(--chart-1))' },
    { name: 'Low Stock', value: lowStockProducts, color: 'hsl(var(--chart-3))' },
    { name: 'Out of Stock', value: products.filter(p => p.in_stock === 0).length, color: 'hsl(var(--chart-5))' },
  ].filter(item => item.value > 0);

  // Top 5 most valuable products
  const topValueProducts = [...products]
    .sort((a, b) => (b.price * b.in_stock) - (a.price * a.in_stock))
    .slice(0, 5);

  const COLORS = ['hsl(var(--primary))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];

  const stats = [
    {
      title: 'Total Products',
      value: totalProducts,
      icon: Package,
      gradient: 'bg-gradient-primary',
      textColor: 'text-primary',
    },
    {
      title: 'Active Products',
      value: activeProducts,
      icon: CheckCircle,
      gradient: 'bg-gradient-success',
      textColor: 'text-success',
    },
    {
      title: 'Low Stock Alerts',
      value: lowStockProducts,
      icon: AlertCircle,
      gradient: 'bg-gradient-destructive',
      textColor: 'text-destructive',
    },
    {
      title: 'Total Value',
      value: `$${totalValue.toFixed(2)}`,
      icon: TrendingUp,
      gradient: 'bg-gradient-primary',
      textColor: 'text-primary',
    },
  ];

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
      <div className="space-y-8">
        {/* Stats Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card 
                key={stat.title} 
                className="overflow-hidden border-0 shadow-medium hover:shadow-lg transition-all duration-300 animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </CardTitle>
                  <div className={`rounded-full p-2 ${stat.gradient}`}>
                    <Icon className="h-4 w-4 text-white" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className={`text-3xl font-bold ${stat.textColor}`}>
                    {stat.value}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Charts Row */}
        {products.length > 0 && (
          <div className="grid gap-6 md:grid-cols-2">
            {/* Stock by Category Chart */}
            <Card className="border-0 shadow-medium">
              <CardHeader>
                <CardTitle className="text-xl">Inventory by Category</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={categoryData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="category" stroke="hsl(var(--muted-foreground))" />
                    <YAxis stroke="hsl(var(--muted-foreground))" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--popover))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                    <Legend />
                    <Bar dataKey="stock" fill="hsl(var(--primary))" name="Stock Quantity" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Stock Status Distribution */}
            <Card className="border-0 shadow-medium">
              <CardHeader>
                <CardTitle className="text-xl">Stock Status Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={stockStatusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {stockStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--popover))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Top Value Products & Category Value */}
        {products.length > 0 && (
          <div className="grid gap-6 md:grid-cols-2">
            {/* Top 5 Most Valuable Products */}
            <Card className="border-0 shadow-medium">
              <CardHeader>
                <CardTitle className="text-xl">Top 5 Most Valuable Items</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topValueProducts.map((product, index) => {
                    const itemValue = product.price * product.in_stock;
                    return (
                      <div
                        key={product.id}
                        className="flex items-center justify-between border-b pb-3 last:border-0"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold">
                            {index + 1}
                          </div>
                          <div>
                            <div className="font-medium">{product.name}</div>
                            <div className="text-sm text-muted-foreground">
                              ${product.price.toFixed(2)} × {product.in_stock} units
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-lg text-primary">
                            ${itemValue.toFixed(2)}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Value by Category */}
            <Card className="border-0 shadow-medium">
              <CardHeader>
                <CardTitle className="text-xl">Value by Category</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={categoryData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis type="number" stroke="hsl(var(--muted-foreground))" />
                    <YAxis dataKey="category" type="category" stroke="hsl(var(--muted-foreground))" width={100} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--popover))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                      formatter={(value: number) => `$${value.toFixed(2)}`}
                    />
                    <Bar dataKey="value" fill="hsl(var(--chart-2))" name="Total Value" radius={[0, 8, 8, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Recent Products */}
        <Card className="border-0 shadow-medium">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-xl">Recent Products</CardTitle>
            <Link to="/products">
              <Button variant="ghost" size="sm" className="gap-1">
                View All
                <ArrowUpRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {products.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Package className="h-12 w-12 text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground text-lg mb-2">No products yet</p>
                <p className="text-sm text-muted-foreground mb-4">Add your first product to get started</p>
                <Link to="/products">
                  <Button>Add Product</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {products.slice(0, 5).map((product, index) => (
                  <div
                    key={product.id}
                    className="flex items-center justify-between border-b pb-4 last:border-0 hover:bg-muted/50 -mx-6 px-6 py-3 rounded-lg transition-colors animate-slide-in"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="flex-1">
                      <div className="font-medium text-lg">{product.name}</div>
                      <div className="text-sm text-muted-foreground flex items-center gap-4 mt-1">
                        <span className="font-mono">SKU: {product.sku}</span>
                        <span className="text-xs">•</span>
                        <span>{product.category}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-lg text-primary">${product.price.toFixed(2)}</div>
                      <div className={`text-sm ${product.in_stock <= product.reorder_level ? 'text-destructive font-medium' : 'text-muted-foreground'}`}>
                        Stock: {product.in_stock}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

