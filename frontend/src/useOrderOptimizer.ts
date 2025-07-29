// hook for optimizing order (the animation states made App.tsx too cluttered)
import { useState } from 'react';
import axios from 'axios';

const API_URL = '/api';

export function useOrderOptimizer() {
    const [optimalOrder, setOptimalOrder] = useState([]);
    const [isOptimizing, setIsOptimizing] = useState(false);
    const [isReleasing, setIsReleasing] = useState(false);

    async function optimizeOrder(payload: any) {
        if (isOptimizing || isReleasing) return;

        setIsOptimizing(true);

        const apiCallPromise = axios.post(`${API_URL}/optimize`, payload);
        const minHoldPromise = new Promise(resolve => setTimeout(resolve, 1000));

        try {
        const [response] = await Promise.all([apiCallPromise, minHoldPromise]);
        const orderWithNumericPrices = response.data.map((item: any) => ({
            ...item,
            price: parseFloat(item.price),
        }));
            setOptimalOrder(orderWithNumericPrices);
        } catch (error) {
            console.error('Error optimizing order ', error);
        } finally {
            setIsOptimizing(false);
            setIsReleasing(true);
            setTimeout(() => setIsReleasing(false), 1000);
        }
    }

    const animationClass = isReleasing ? 'release-effect' : isOptimizing ? 'shrinking-effect' : '';

    return { optimalOrder, animationClass, optimizeOrder };
}