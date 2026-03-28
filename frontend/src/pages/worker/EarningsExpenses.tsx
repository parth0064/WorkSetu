import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
    TrendingUp, 
    TrendingDown, 
    DollarSign, 
    Download, 
    Plus, 
    Trash2, 
    Calendar,
    Loader2,
    PieChart as PieChartIcon
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { getTransactions, getExpenses, addExpense, deleteExpense } from '@/services/walletService';
import * as XLSX from 'xlsx';

const EarningsExpenses = () => {
    const { toast } = useToast();
    const [loading, setLoading] = useState(true);
    const [earnings, setEarnings] = useState<any[]>([]);
    const [expenses, setExpenses] = useState<any[]>([]);
    const [isAdding, setIsAdding] = useState(false);
    const [newExpense, setNewExpense] = useState({ title: '', amount: '', date: new Date().toISOString().split('T')[0] });

    const fetchData = async () => {
        try {
            const txData = await getTransactions();
            const expData = await getExpenses();
            
            // Filter earnings from wallet (credits related to jobs)
            const jobEarnings = txData.data.filter((tx: any) => tx.type === 'credit' && tx.onModel === 'Job');
            setEarnings(jobEarnings);
            setExpenses(expData.data);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleAddExpense = async () => {
        if (!newExpense.title || !newExpense.amount) return;
        setIsAdding(true);
        try {
            await addExpense({
                title: newExpense.title,
                amount: Number(newExpense.amount),
                date: newExpense.date
            });
            toast({ title: 'Expense Added', description: 'Your expense has been recorded successfully.' });
            setNewExpense({ title: '', amount: '', date: new Date().toISOString().split('T')[0] });
            fetchData();
        } catch (error) {
            toast({ variant: 'destructive', title: 'Error', description: 'Failed to add expense.' });
        } finally {
            setIsAdding(false);
        }
    };

    const handleDeleteExpense = async (id: string) => {
        try {
            await deleteExpense(id);
            toast({ title: 'Expense Deleted' });
            fetchData();
        } catch (error) {
            toast({ variant: 'destructive', title: 'Error', description: 'Failed to delete expense.' });
        }
    };

    const exportToExcel = () => {
        const data = [
            ...earnings.map(e => ({ Type: 'Earning', Title: e.description, Amount: e.amount, Date: new Date(e.createdAt).toLocaleDateString() })),
            ...expenses.map(exp => ({ Type: 'Expense', Title: exp.title, Amount: exp.amount, Date: new Date(exp.date).toLocaleDateString() }))
        ];

        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Finances");
        XLSX.writeFile(workbook, "WorkSetu_Finances.xlsx");
    };

    const totalEarnings = earnings.reduce((acc, curr) => acc + curr.amount, 0);
    const totalExpenses = expenses.reduce((acc, curr) => acc + curr.amount, 0);
    const netIncome = totalEarnings - totalExpenses;

    if (loading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin" /></div>;

    return (
        <div className="p-6 space-y-6 max-w-6xl mx-auto pb-12">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Earnings & Expenses</h1>
                    <p className="text-muted-foreground">Manage your finances and track your net income</p>
                </div>
                <Button variant="outline" onClick={exportToExcel} className="flex items-center gap-2">
                    <Download size={18} /> Export Excel
                </Button>
            </div>

            {/* Monthly Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-success/10 border-success/20">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-success flex items-center gap-2">
                            <TrendingUp size={16} /> Total Earnings
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-success">₹{totalEarnings.toLocaleString()}</div>
                    </CardContent>
                </Card>

                <Card className="bg-destructive/10 border-destructive/20">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-destructive flex items-center gap-2">
                            <TrendingDown size={16} /> Total Expenses
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-destructive">₹{totalExpenses.toLocaleString()}</div>
                    </CardContent>
                </Card>

                <Card className="bg-primary/10 border-primary/20">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-primary flex items-center gap-2">
                            <DollarSign size={16} /> Net Income
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-primary">₹{netIncome.toLocaleString()}</div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Earnings List */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <TrendingUp size={20} className="text-success" /> Recent Earnings
                        </CardTitle>
                        <CardDescription>Automatic earnings from completed jobs</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {earnings.length === 0 ? (
                                <div className="text-center py-12 text-muted-foreground">No earnings recorded yet</div>
                            ) : (
                                earnings.map((e) => (
                                    <div key={e._id} className="flex justify-between items-center p-3 border rounded-lg hover:bg-accent/50 transition-colors">
                                        <div>
                                            <div className="font-medium">{e.description}</div>
                                            <div className="text-xs text-muted-foreground">{new Date(e.createdAt).toLocaleDateString()}</div>
                                        </div>
                                        <div className="font-bold text-success">+₹{e.amount.toLocaleString()}</div>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Expenses Section */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="flex items-center gap-2">
                                <TrendingDown size={20} className="text-destructive" /> Expenses
                            </CardTitle>
                            <CardDescription>Track your tool purchases, travel, etc.</CardDescription>
                        </div>
                        <Dialog>
                            <DialogTrigger asChild>
                                <Button size="sm" className="flex items-center gap-1">
                                    <Plus size={16} /> Add Expense
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Record New Expense</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4 py-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Title</label>
                                        <Input 
                                            placeholder="e.g., New Cement Mixer" 
                                            value={newExpense.title}
                                            onChange={(e) => setNewExpense({...newExpense, title: e.target.value})}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Amount (₹)</label>
                                        <Input 
                                            type="number" 
                                            placeholder="0.00" 
                                            value={newExpense.amount}
                                            onChange={(e) => setNewExpense({...newExpense, amount: e.target.value})}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Date</label>
                                        <Input 
                                            type="date" 
                                            value={newExpense.date}
                                            onChange={(e) => setNewExpense({...newExpense, date: e.target.value})}
                                        />
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button onClick={handleAddExpense} disabled={isAdding}>
                                        {isAdding ? <Loader2 className="animate-spin mr-2" size={16} /> : null}
                                        Save Expense
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {expenses.length === 0 ? (
                                <div className="text-center py-12 text-muted-foreground">No expenses recorded yet</div>
                            ) : (
                                expenses.map((exp) => (
                                    <div key={exp._id} className="group flex justify-between items-center p-3 border rounded-lg hover:bg-accent/50 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-destructive/10 text-destructive rounded-lg">
                                                <Calendar size={18} />
                                            </div>
                                            <div>
                                                <div className="font-medium">{exp.title}</div>
                                                <div className="text-xs text-muted-foreground">{new Date(exp.date).toLocaleDateString()}</div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="font-bold text-destructive">-₹{exp.amount.toLocaleString()}</div>
                                            <Button 
                                                variant="ghost" 
                                                size="icon" 
                                                className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive hover:bg-destructive/10"
                                                onClick={() => handleDeleteExpense(exp._id)}
                                            >
                                                <Trash2 size={16} />
                                            </Button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default EarningsExpenses;
