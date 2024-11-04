import React, { useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button, Grid, Paper, Typography } from "@mui/material";
import Pagination from "../../Common/UtilityCommon/Pagination";
import SearchBar from "../../Common/UtilityCommon/SearchBar";
import PerPageSelect from "../../Common/UtilityCommon/PerPageSelect";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function TableUtility({ title, apiUrl, columns, rowKey, addUrl, detailUrl, renderFilter }) {
    const companyCode = sessionStorage.getItem('Company_Code');
    const Year_Code = sessionStorage.getItem('Year_Code');

    const [fetchedData, setFetchedData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [perPage, setPerPage] = useState(15);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get(`${apiUrl}?Company_Code=${companyCode}&Year_Code=${Year_Code}`);
                if (response.data) {
                    const dataKey = Object.keys(response.data)[0];
                    setFetchedData(response.data[dataKey]);
                    setFilteredData(response.data[dataKey]);
                }
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };
        fetchData();
    }, [apiUrl]);

    useEffect(() => {
        const filtered = fetchedData.filter(post => {
            const searchTermLower = searchTerm.toLowerCase();
            return Object.keys(post).some(key =>
                String(post[key]).toLowerCase().includes(searchTermLower)
            );
        });
        setFilteredData(filtered);
        setCurrentPage(1);
    }, [searchTerm, fetchedData]);

    const handlePerPageChange = (event) => {
        setPerPage(event.target.value);
        setCurrentPage(1);
    };

    const handleSearchTermChange = (event) => {
        setSearchTerm(event.target.value);
    };

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    const handleRowClick = (rowId) => {
        const selectedRecord = filteredData.find(record => record[rowKey] === rowId);
        navigate(detailUrl, { state: { selectedRecord } });
    };

    const handleAddClick = () => {
        navigate(addUrl);
    };

    const handleBackClick = () => {
        navigate("/DashBoard");
    };

    const pageCount = Math.ceil(filteredData.length / perPage);
    const paginatedPosts = filteredData.slice((currentPage - 1) * perPage, currentPage * perPage);

    return (
        <div>
            <Typography variant="h6" style={{ textAlign: 'center' }}>{title}</Typography>
            <Grid container spacing={2}>
                <Grid item>
                    <Button variant="contained" color="primary" onClick={handleAddClick}>Add</Button>
                </Grid>
                <Grid item>
                    <Button variant="contained" color="secondary" onClick={handleBackClick}>Back</Button>
                </Grid>
                <Grid item>
                    <PerPageSelect value={perPage} onChange={handlePerPageChange} />
                </Grid>
                <Grid item xs={10} sm={10}>
                    <SearchBar
                        value={searchTerm}
                        onChange={handleSearchTermChange}
                    />
                </Grid>
                {renderFilter && renderFilter()}
                <Grid item xs={12}>
                    <Paper elevation={20}>
                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        {columns.map((column, index) => (
                                            <TableCell key={index}>{column.label}</TableCell>
                                        ))}
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {paginatedPosts.map((post) => (
                                        <TableRow
                                            key={post[rowKey]}
                                            style={{ cursor: "pointer" }}
                                            onDoubleClick={() => handleRowClick(post[rowKey])}
                                        >
                                            {columns.map((column, index) => (
                                                <TableCell key={index}>{post[column.key]}</TableCell>
                                            ))}
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Paper>
                </Grid>
                <Grid item xs={12}>
                    <Pagination
                        pageCount={pageCount}
                        currentPage={currentPage}
                        onPageChange={handlePageChange}
                    />
                </Grid>
            </Grid>
        </div>
    );
}

export default TableUtility;
