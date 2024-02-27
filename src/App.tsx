import { useForm, SubmitHandler } from "react-hook-form";
import { useEffect, useState } from "react";
import { supabase } from "./lib/supabase";
import RenderTable from "./components/RenderTable";

type Inputs = {
	nombre: string;
	id: string;
	depto: string;
	puesto: string;
	funciones: string;
	correo_personal: string;
	estado: string;
};
type FlattenedInputs = {
	nombre: string;
	id: string;
	depto: string;
	puesto: string;
	funciones: string;
	correo_personal: string;
	estado: string;
};
export default function App() {
	const [data, setData] = useState<Inputs>();
	const [result, setResult] = useState<FlattenedInputs[]>();
	const fetchData = async () => {
		const { data, error } = await supabase
			.from("correos_a_sincronizar")
			.select("*, correos_inst(*)")
			.order("identidad", { ascending: true });

		if (error) console.log("error", error);
		else {
			const flattenedData = data?.map((d) => {
				return {
					identidad: d.identidad,
					correo_institucional: d.correo_institucional,
					clave: d.clave,
					correo_personal: d.correos_inst.correo_personal,
					depto: d.correos_inst.depto,
					puesto: d.correos_inst.puesto,
					funciones: d.correos_inst.funciones,
					estado: d.correos_inst.estado,
					nombre: d.correos_inst.nombre,
				};
			});
			setResult(flattenedData);
			console.log("data", flattenedData);
		}
	};

	function formatEmail(name: string) {
		const parts = name.toLowerCase().split(" ");
		if (parts.length !== 4) {
			throw new Error("Name must consist of four words");
		}
		return `${parts[0]}.${parts[1].charAt(0)}.${parts[2]}@salud.gob.hn`;
	}
	function generateRandomString() {
		const randomNumber = Math.floor(Math.random() * 10000000000000); // Generates a random number between 0 and 9999999999999
		return `Clave.${randomNumber}`;
	}
	useEffect(() => {
		const fetchData = async () => {
			const { data, error } = await supabase
				.from("correos_a_sincronizar")
				.select("*, correos_inst(*)")
				.order("identidad", { ascending: true });

			if (error) console.log("error", error);
			else {
				const flattenedData = data?.map((d) => {
					return {
						identidad: d.identidad,
						correo_institucional: d.correo_institucional,
						clave: d.clave,
						correo_personal: d.correos_inst.correo_personal,
						depto: d.correos_inst.depto,
						puesto: d.correos_inst.puesto,
						funciones: d.correos_inst.funciones,
						estado: d.correos_inst.estado,
						nombre: d.correos_inst.nombre,
					};
				});
				setResult(flattenedData);
				console.log("data", flattenedData);
			}
		};
		fetchData();

		return () => {};
	}, []);

	const {
		register,
		handleSubmit,
		formState: { errors },
		reset,
	} = useForm<Inputs>();
	const onSubmit: SubmitHandler<Inputs> = async (data) => {
		setData(data);
		const identidad = data.id;
		const correo_institucional = formatEmail(data.nombre);
		const clave = generateRandomString();
		if (!data.id) {
			console.error("Error: id is null");
			return;
		}
		// Check if user already exists in 'correos_inst'
		const { data: existingUser1, error: selectError1 } = await supabase
			.from("correos_inst")
			.select("id")
			.eq("id", data.id);

		if (selectError1) {
			console.error("Error fetching user:", selectError1);
			return;
		}

		if (existingUser1 && existingUser1.length > 0) {
			console.log("User already exists in 'correos_inst'");
		} else {
			// If user does not exist in 'correos_inst', insert new row
			try {
				const { error } = await supabase.from("correos_inst").insert(data);

				if (error) {
					throw error;
				}

				console.log("Row inserted successfully in 'correos_inst'");
			} catch (error) {
				console.error("Error:", error);
			}
		}

		fetchData();

		// Check if user already exists in 'correos_a_sincronizar'
		const { data: existingUser, error: selectError } = await supabase
			.from("correos_a_sincronizar")
			.select("identidad")
			.eq("identidad", identidad);

		if (selectError) {
			console.error("Error fetching user:", selectError);
			return;
		}

		if (existingUser && existingUser.length > 0) {
			console.log("User already exists in 'correos_a_sincronizar'");
		} else {
			// If user does not exist in 'correos_a_sincronizar', insert new row
			try {
				const { error } = await supabase
					.from("correos_a_sincronizar")
					.insert({ identidad, correo_institucional, clave });

				if (error) {
					throw error;
				}

				console.log("Row inserted successfully in 'correos_a_sincronizar'");
			} catch (error) {
				console.error("Error:", error);
			}
		}
		reset();
	};

	return (
		<div className='flex flex-row'>
			<form
				onSubmit={handleSubmit(onSubmit)}
				className='bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4 w-[30%]'
			>
				<input
					{...register("id", { required: "ID is required" })}
					type='text'
					placeholder='ID'
				/>
				{[
					"nombre",
					"correo_personal",
					"depto",
					"puesto",
					"funciones",
					"estado",
				].map((field) => (
					<div className='mb-4' key={field}>
						<label
							className='block text-gray-700 text-sm font-bold mb-2'
							htmlFor={field}
						>
							{field.charAt(0).toUpperCase() + field.slice(1)}
						</label>
						<input
							className='shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline'
							id={field}
							type='text'
							placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
							{...register(field, {
								required: true, // The field is required
								pattern:
									field === "email"
										? /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i
										: undefined,
							})}
						/>

						{errors[field] && (
							<p className='text-red-500 text-xs italic'>
								Este campo es obligatorio.
							</p>
						)}
					</div>
				))}
				<div className='flex items-center justify-between'>
					<button
						className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline'
						type='submit'
					>
						Submit
					</button>
				</div>
			</form>
			<div className='w-[60%]'>
				<RenderTable results={result || []} />
			</div>
		</div>
	);
}
