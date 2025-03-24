import { useGaming } from "../../context/GamingContext";
import { Employee } from "../../interface";

export default function EmployeeComponent({ employee }: { employee: Employee }) {
    const { state, dispatch } = useGaming();

    if (employee.job == "Senior Miner" && state.company.level < 5) {
        return <div></div>;
    }

    if (employee.job == "Yeti" && state.company.level < 15) {
        return <div></div>;
    }

    if (employee.job == "Frost Mage" && state.company.level < 10) {
        return <div></div>;
    }

    return (
        <div className="employee">
            <button 
                onClick={() => dispatch({ type: "PAY_EMPLOYEE", payload: employee })}
                disabled={employee.amount == 0}
            >
                Pay {employee.job}
            </button>
            <button 
                onClick={() => dispatch({ type: "HIRED_EMPLOYEE", payload: employee })}
            >
                <div>{employee.job}</div>
                <div>
                    <div>Quantity: {employee.amount}</div>
                    <div>Salary: {employee.salary.toFixed(2) || 0} $</div>
                    <div>Happiness: {employee.happiness.toFixed(2) || 0}%</div>
                    <div>Production: {employee.production.toFixed(2) || 0}</div>
                </div>
            </button>
        </div>
    )       
}