import { useState, useEffect, useCallback } from "react";

interface Toast {
	id: number;
	message: string;
	type?: "success" | "error" | "info";
}

const useToast = () => {
	const [toasts, setToasts] = useState<Toast[]>([]);

	const addToast = useCallback(
		(message: string, type: "success" | "error" | "info") => {
			const id = Date.now();
			const newToast: Toast = { id, message, type };
			setToasts([...toasts, newToast]);

			setTimeout(() => {
				removeToast(id);
			}, 5000);
		},
		[toasts],
	);

	const removeToast = (id: number) => {
		const newToasts = toasts.filter((toast) => toast.id !== id);
		setToasts([...newToasts]);
	};

	return {
		toasts,
		addToast,
	};
};

export default useToast;
