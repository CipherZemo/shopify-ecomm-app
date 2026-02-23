import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../../api/axios';

// Create order
export const createOrder = createAsyncThunk(
    'orders/create',
    async (shippingAddress, { rejectWithValue }) => {
        try {
            const { data } = await API.post('/orders', { shippingAddress });
            return data;
        } catch (error) {
            return rejectWithValue(error.response.data.message);
        }
    }
);

// Get user orders
export const fetchMyOrders = createAsyncThunk(
    'orders/fetchMy',
    async (_, { rejectWithValue }) => {
        try {
            const { data } = await API.get('/orders/my');
            return data;
        } catch (error) {
            return rejectWithValue(error.response.data.message);
        }
    }
);

// Cancel order
export const cancelOrder = createAsyncThunk(
    'orders/cancel',
    async (orderId, { rejectWithValue }) => {
        try {
            const { data } = await API.put(`/orders/${orderId}/cancel`);
            return data;
        } catch (error) {
            return rejectWithValue(error.response.data.message);
        }
    }
);

const orderSlice = createSlice({
    name: 'orders',
    initialState: {
        orders: [],
        currentOrder: null,
        loading: false,
        error: null,
        successMessage: null,
    },
    reducers: {
        clearMessages: (state) => {
            state.error = null;
            state.successMessage = null;
        },
        clearCurrentOrder: (state) => {
            state.currentOrder = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Create order
            .addCase(createOrder.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createOrder.fulfilled, (state, action) => {
                state.loading = false;
                state.currentOrder = action.payload;
                state.successMessage = 'Order placed successfully!';
            })
            .addCase(createOrder.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Fetch my orders
            .addCase(fetchMyOrders.fulfilled, (state, action) => {
                state.orders = action.payload;
            })
            // Cancel order
            .addCase(cancelOrder.fulfilled, (state, action) => {
                state.orders = state.orders.map((order) =>
                    order._id === action.payload.order._id ? action.payload.order : order
                );
                state.successMessage = 'Order cancelled successfully!';
            });
    },
});

export const { clearMessages, clearCurrentOrder } = orderSlice.actions;
export default orderSlice.reducer;