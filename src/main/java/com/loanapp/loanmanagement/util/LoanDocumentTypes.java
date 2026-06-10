package com.loanapp.loanmanagement.util;

import com.loanapp.loanmanagement.enums.LoanType;

import java.util.Map;
import java.util.Set;

public final class LoanDocumentTypes {

    public static final String SALARY_SLIP = "SALARY_SLIP";
    public static final String PROPERTY_DOCUMENT = "PROPERTY_DOCUMENT";
    public static final String VEHICLE_QUOTATION = "VEHICLE_QUOTATION";

    private static final Set<String> LOAN_APPLICATION_TYPES = Set.of(
            SALARY_SLIP, PROPERTY_DOCUMENT, VEHICLE_QUOTATION
    );

    private static final Map<LoanType, String> REQUIRED_BY_LOAN_TYPE = Map.of(
            LoanType.PERSONAL_LOAN, SALARY_SLIP,
            LoanType.HOME_LOAN, PROPERTY_DOCUMENT,
            LoanType.VEHICLE_LOAN, VEHICLE_QUOTATION
    );

    private static final Map<LoanType, String> LABEL_BY_LOAN_TYPE = Map.of(
            LoanType.PERSONAL_LOAN, "Salary Slip",
            LoanType.HOME_LOAN, "Property Document",
            LoanType.VEHICLE_LOAN, "Vehicle Quotation"
    );

    private LoanDocumentTypes() {
    }

    public static String requiredTypeFor(LoanType loanType) {
        return REQUIRED_BY_LOAN_TYPE.get(loanType);
    }

    public static String labelFor(LoanType loanType) {
        return LABEL_BY_LOAN_TYPE.getOrDefault(loanType, "Loan Document");
    }

    public static boolean isLoanApplicationDocument(String documentType) {
        return documentType != null && LOAN_APPLICATION_TYPES.contains(documentType);
    }

    public static boolean requiresDocument(LoanType loanType) {
        return REQUIRED_BY_LOAN_TYPE.containsKey(loanType);
    }
}
