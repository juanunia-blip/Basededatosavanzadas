import { dashboard, expenses, transactions, trend } from "../utils/icons"
export const menuItems = [
    {
        id: 1,
        title: 'Panel',
        icon: dashboard,
        link: '/dashboard'
    },
    {
        id: 2,
        title: 'Ver transacciónes',
        icon: transactions,
        link: '/dashboard'
    },
    {
        id: 3,
        title: 'Ingresos',
        icon: trend,
        link: '/dashboard'
    },
    {
        id: 4,
        title: 'Gastos',
        icon: expenses,
        link: '/dashboard'
    },

]