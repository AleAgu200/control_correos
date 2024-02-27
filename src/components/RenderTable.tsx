import { FilterMatchMode } from "primereact/api";
import { useEffect, useState } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { InputText } from "primereact/inputtext";

type FlattenedInputs = {
	nombre: string;
	id: string;
	depto: string;
	puesto: string;
	funciones: string;
	correo_personal: string;
	estado: string;
};

type RenderTableProps = {
	results: FlattenedInputs[];
};

// ...
const RenderTable: React.FC<RenderTableProps> = ({ results }) => {
	console.log("🚀 ~ results:", results);
	const [filters, setFilters] = useState({
		global: { value: null, matchMode: FilterMatchMode.CONTAINS },
		nombre: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
		depto: { value: null, matchMode: FilterMatchMode.IN },
		puesto: { value: null, matchMode: FilterMatchMode.EQUALS },
	});
	const [loading, setLoading] = useState(true);
	const [globalFilterValue, setGlobalFilterValue] = useState("");
	const onGlobalFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value;
		const _filters = { ...filters };

		_filters["global"].value = value !== "" ? value : (null as null);

		setFilters(_filters);
		setGlobalFilterValue(value);
	};
	useEffect(() => {
		results && setLoading(false);
	}, [results]);
	const renderHeader = () => {
		return (
			<div className='flex justify-content-end'>
				<span className='p-input-icon-left'>
					<i className='pi pi-search' />
					<InputText
						value={globalFilterValue}
						onChange={onGlobalFilterChange}
						placeholder='Keyword Search'
					/>
				</span>
			</div>
		);
	};
	const header = renderHeader();
	return (
		<div className='card'>
			<DataTable
				value={results}
				paginator
				rows={10}
				rowsPerPageOptions={[5, 10, 25, 50]}
				dataKey='identidad'
				filters={filters}
				filterDisplay='row'
				loading={loading}
				globalFilterFields={[
					"nombre",
					"depto",
					"puesto",
					"funciones",
					"correo_personal",
					"identidad",
				]}
				header={header}
				emptyMessage='No customers found.'
			>
				<Column
					field='nombre'
					header='nombre'
					filter
					filterPlaceholder='buscar name'
					style={{ minWidth: "12rem" }}
				/>
				<Column
					field='identidad'
					header='identidad'
					filter
					filterPlaceholder='buscar identidad'
					style={{ minWidth: "12rem" }}
				/>
				<Column
					field='depto'
					header='depto'
					filter
					filterPlaceholder='buscar depto'
					style={{ minWidth: "12rem" }}
				/>

				<Column
					field='puesto'
					header='puesto'
					filter
					filterPlaceholder='buscar puesto'
					style={{ minWidth: "12rem" }}
				/>

				<Column
					field='funciones'
					header='funciones'
					filter
					filterPlaceholder='buscar funciones'
					style={{ minWidth: "12rem" }}
				/>

				<Column
					field='correo_personal'
					header='correo_personal'
					filter
					filterPlaceholder='buscar correo_personal'
					style={{ minWidth: "12rem" }}
				/>

				<Column
					field='estado'
					header='estado'
					filter
					filterPlaceholder='buscar estado'
					style={{ minWidth: "12rem" }}
				/>
			</DataTable>
		</div>
	);
};

export default RenderTable;
