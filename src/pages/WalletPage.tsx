import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Wallet, ArrowUpRight, ArrowDownLeft, Clock, Plus, CreditCard, History, Loader2, ArrowRightLeft } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { getWallet, addFunds, getTransactions } from '@/services/walletService';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';

const WalletPage = () => {
    const { user } = useAuth();
    const { toast } = useToast();
    const [wallet, setWallet] = useState({ balance: 0, pending: 0 });
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [addAmount, setAddAmount] = useState('');
    const [isAdding, setIsAdding] = useState(false);
    const [withdrawAmount, setWithdrawAmount] = useState('');
    const [isWithdrawing, setIsWithdrawing] = useState(false);

    const fetchData = async () => {
        try {
            const walletData = await getWallet();
            const txData = await getTransactions();
            setWallet(walletData.data);
            setTransactions(txData.data);
        } catch (error) {
            console.error('Error fetching wallet data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleAddFunds = async () => {
        if (!addAmount || Number(addAmount) <= 0) return;
        setIsAdding(true);
        try {
            await addFunds(Number(addAmount));
            toast({ title: 'Funds Added', description: `Successfully added ₹${addAmount} to your wallet.` });
            setAddAmount('');
            fetchData();
        } catch (error: any) {
            const message = error.response?.data?.message || 'Failed to add funds.';
            toast({ variant: 'destructive', title: 'Error', description: message });
        } finally {
            setIsAdding(false);
        }
    };

    const handleWithdraw = async () => {
        if (!withdrawAmount || Number(withdrawAmount) <= 0) {
            toast({ variant: 'destructive', title: 'Invalid Amount', description: 'Please enter a valid amount to withdraw.' });
            return;
        }
        if (Number(withdrawAmount) > wallet.balance) {
            toast({ variant: 'destructive', title: 'Insufficient Funds', description: 'You cannot withdraw more than your available balance.' });
            return;
        }

        setIsWithdrawing(true);
        // Fake dummy delay
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        toast({ 
            title: 'Withdrawal Initiated', 
            description: `₹${withdrawAmount} is being transferred to your bank account. (Dummy Action)` 
        });
        
        setWithdrawAmount('');
        setIsWithdrawing(false);
    };

    if (loading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin" /></div>;

    return (
        <div className="p-6 space-y-6 max-w-6xl mx-auto">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold tracking-tight">Your Wallet</h1>
                <div className="flex gap-3">
                    {/* Withdraw Funds (Dummy) */}
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button variant="outline" className="flex items-center gap-2 border-primary text-primary hover:bg-primary/5">
                                <ArrowRightLeft size={18} /> Withdraw
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Withdraw Funds</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                                <p className="text-sm text-muted-foreground mb-2">
                                    Transfer available funds to your linked bank account.
                                </p>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Amount to Withdraw (₹)</label>
                                    <Input 
                                        type="number" 
                                        placeholder={`Max ₹${wallet.balance.toLocaleString()}`} 
                                        value={withdrawAmount}
                                        onChange={(e) => setWithdrawAmount(e.target.value)}
                                        max={wallet.balance}
                                    />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setWithdrawAmount('')}>Cancel</Button>
                                <Button onClick={handleWithdraw} disabled={isWithdrawing}>
                                    {isWithdrawing ? <Loader2 className="animate-spin mr-2" size={16} /> : null}
                                    Confirm Withdraw
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>

                    {/* Add Funds */}
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button className="flex items-center gap-2">
                                <Plus size={18} /> Add Funds
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Add Funds to Wallet</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Amount (₹)</label>
                                <Input 
                                    type="number" 
                                    placeholder="Enter amount" 
                                    value={addAmount}
                                    onChange={(e) => setAddAmount(e.target.value)}
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setAddAmount('')}>Cancel</Button>
                            <Button onClick={handleAddFunds} disabled={isAdding}>
                                {isAdding ? <Loader2 className="animate-spin mr-2" size={16} /> : null}
                                Add Now
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    <Card className="bg-gradient-to-br from-primary to-primary/80 text-white border-none shadow-xl">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-primary-foreground/80">Available Balance</CardTitle>
                            <CreditCard className="text-primary-foreground/80" size={20} />
                        </CardHeader>
                        <CardContent>
                            <div className="text-4xl font-bold">₹{wallet.balance.toLocaleString()}</div>
                            <p className="text-xs text-primary-foreground/60 mt-1">Ready to use for payments</p>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                    <Card className="border-dashed">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Pending (Escrow)</CardTitle>
                            <Clock className="text-muted-foreground" size={20} />
                        </CardHeader>
                        <CardContent>
                            <div className="text-4xl font-bold text-muted-foreground">₹{wallet.pending.toLocaleString()}</div>
                            <p className="text-xs text-muted-foreground/60 mt-1">Will be released after work completion</p>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <History size={20} /> Transaction History
                    </CardTitle>
                    <CardDescription>All your wallet activity is listed here</CardDescription>
                </CardHeader>
                <CardContent>
                    <Tabs defaultValue="all">
                        <TabsList className="mb-4">
                            <TabsTrigger value="all">All</TabsTrigger>
                            <TabsTrigger value="credit">Credits</TabsTrigger>
                            <TabsTrigger value="debit">Debits</TabsTrigger>
                        </TabsList>
                        
                        <div className="space-y-4">
                            {transactions.length === 0 ? (
                                <div className="text-center py-12 text-muted-foreground">No transactions found</div>
                            ) : (
                                transactions.map((tx: any) => (
                                    <div key={tx._id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className={`p-2 rounded-full ${tx.type === 'credit' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                                {tx.type === 'credit' ? <ArrowDownLeft size={20} /> : <ArrowUpRight size={20} />}
                                            </div>
                                            <div>
                                                <div className="font-medium">{tx.description}</div>
                                                <div className="text-xs text-muted-foreground">{new Date(tx.createdAt).toLocaleDateString()} at {new Date(tx.createdAt).toLocaleTimeString()}</div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className={`font-bold ${tx.type === 'credit' ? 'text-green-600' : 'text-red-600'}`}>
                                                {tx.type === 'credit' ? '+' : '-'}₹{Math.abs(tx.amount).toLocaleString()}
                                            </div>
                                            <Badge variant={tx.status === 'completed' ? 'secondary' : 'outline'}>
                                                {tx.status}
                                            </Badge>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </Tabs>
                </CardContent>
            </Card>
        </div>
    );
};

export default WalletPage;
