import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../../api/axios';

// Create Razorpay order
export const createPaymentOrder = createAsyncThunk(
    'payment/createOrder',
    async (orderId, { rejectWithValue }) => {
        try {
            const { data } = await API.post('/payments/create-order', { orderId });
            return data;
        } catch (error) {
            return rejectWithValue(error.response.data.message);
        }
    }
);

// Verify payment
export const verifyPayment = createAsyncThunk(
    'payment/verify',
    async (paymentData, { rejectWithValue }) => {
        try {
            const { data } = await API.post('/payments/verify', paymentData);
            return data;
        } catch (error) {
            return rejectWithValue(error.response.data.message);
        }
    }
);

// Handle payment failure
export const handlePaymentFailure = createAsyncThunk(
    'payment/failure',
    async (failureData, { rejectWithValue }) => {
        try {
            const { data } = await API.post('/payments/failure', failureData);
            return data;
        } catch (error) {
            return rejectWithValue(error.response.data.message);
        }
    }
);

const paymentSlice = createSlice({
    name: 'payment',
    initialState: {
        razorpayOrder: null,
        paymentStatus: null,
        loading: false,
        error: null,
    },
    reducers: {
        clearPaymentState: (state) => {
            state.razorpayOrder = null;
            state.paymentStatus = null;
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Create payment order
            .addCase(createPaymentOrder.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createPaymentOrder.fulfilled, (state, action) => {
                state.loading = false;
                state.razorpayOrder = action.payload;
            })
            .addCase(createPaymentOrder.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Verify payment
            .addCase(verifyPayment.fulfilled, (state) => {
                state.paymentStatus = 'success';
            })
            .addCase(verifyPayment.rejected, (state, action) => {
                state.paymentStatus = 'failed';
                state.error = action.payload;
            });
    },
});

export const { clearPaymentState } = paymentSlice.actions;
export default paymentSlice.reducer;    