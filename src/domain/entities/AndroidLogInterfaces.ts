export type LogcatTag =
  | 'EEEWW'
  | 'VERIFY'
  | 'AUTORIZATION'
  | 'CASA'
  | 'INFO TASAS'
  | 'Error Envió'
  | 'Estado de la Red'
  | 'PRODUCTS'
  | 'EXPENSES'
  | 'fragment_client'
  | 'AGE'
  | 'Toast'
  | 'error'
  | 'SYNC'
  | 'INFO RULE GUARANTEE'
  | 'Product'
  | 'FlujocomponenteCamara'
  | 'ResponseRules'
  | 'codeselected'
  | 'BasicInsurance'
  | 'FormProposalFragment'
  | 'Endpoint'
  | 'FormProposalViewModel'
  | 'ApiCustomer'
  | 'Respuesta phone'
  | 'Respuesta address'
  | 'Lista de creditos'
  | 'pulling json'
  | 'get Documentos Requeridos'
  | 'Id instancia de proceso'
  | 'RESPONSE DATABASE'
  | 'Tag getCustomer';

export interface AndroidLogMetadata {
  pid: number;
  tid: number;
  tag: LogcatTag;
  rawTimestamp: string;
}

export interface AuthToken {
  token: string;
  issuer: string;
  subject: string;
  clientId: string;
  originJti: string;
  eventId: string;
  tokenUse: string;
  scope: string;
  authTime: number;
  exp: number;
  iat: number;
  jti: string;
  username: string;
}

export interface RateVariable {
  dataType: string;
  variableName: string;
  variableValue: string;
}

export interface HttpError {
  message: string;
  error: Array<{
    code: string;
    message: string;
  }>;
  httpStatus: number;
}

export interface Product {
  id: number;
  margin: string;
  monthly_cost: string;
  monthly_sales: string;
  name: string;
}

export interface CustomerFragmentInfo {
  type: 'birthday' | 'civil_state' | 'segment';
  target: 'customer' | 'spouse';
  field: string;
  value: string;
}

export interface AgeCalculation {
  birthDate: string;
  currentDate: string;
  age: number;
}

export interface SyncStatus {
  date: string;
  status: 'success' | 'failed';
}

export interface RuleGuaranteeInfo {
  name: string;
  value: string;
}

export interface RuleResult {
  ruleName: string;
  ruleResult: Array<{
    name: string;
    value: string;
  }>;
  status: boolean;
}

export interface BusinessProduct {
  businessAnalysis_id: number;
  cost_sales: string;
  id: number;
  labor_value: string;
  name: string;
  raw_material_value: string;
  sales_price: string;
  unit_measure: string;
}

export interface BasicInsuranceInfo {
  creditApplicationId: number;
  documentNumber: string;
  rule: {
    acronym: string;
  };
  stage: string;
  variables: RateVariable[];
}

export interface EndpointCall {
  endpointId: string;
  path: string;
  requestBody: string;
  statusCode: number;
  response: string;
}

export interface FormProposalInfo {
  insuranceCode: string;
  code: number;
  data: BasicInsuranceInfo;
}

export interface CustomerData {
  naturalPerson: {
    code: number;
    identification: {
      number: string;
      type: {
        code: string;
      };
    };
    name: string;
    otherName: string;
    lastName: string;
    otherLastName: string;
    status: {
      code: string;
    };
    subsidiary: {
      code: number;
    };
    branch: {
      code: number;
    };
    enrollmentDate: string;
    lastUpdateDate: string;
    officer: {
      code: number;
    };
    retention: boolean;
    sex: {
      code: string;
    };
    gender: {
      code: string;
    };
    birthDate: string;
    profession: {
      code: string;
    };
    maritalStatus: {
      code: string;
    };
    dependant: number;
    degreeLevel: {
      code: string;
    };
    relationship: boolean;
    currentOperationsWithFinancialEntity: boolean;
    countryBirth: {
      code: number;
    };
    foreignerNaturalised: boolean;
    immigration: string;
    foreignIdentification: {
      number: string;
    };
    originAddress: string;
    homeTown: string;
    isSpouse: boolean;
    spouseIdentification: {
      number: string;
      type: {
        code: string;
      };
    };
  };
}

export interface CustomerResponse {
  birthDate: string;
  code: number;
  countryBirth: number;
  currentOperationsWithFinancialEntity: boolean;
  degreeLevel: {
    code: string;
  };
  dependants: number;
  document_number: string;
  economicGroup: {
    code: number;
  };
  enrollmentDate: string;
  foreignIdentification: {
    code: string;
  };
  foreignerNaturalised: boolean;
  gender: string;
  identification: {
    number: string;
    type: {
      code: string;
    };
  };
  immigration: string;
  isSpouse: boolean;
  lastUpdateDate: string;
  lastname: string;
  maritalStatus: string;
  name: string;
  occupation: {
    code: string;
  };
  officer: {
    code: number;
  };
  otherLastName: string;
  otherName: string;
  profession: {
    code: string;
  };
  relationship: boolean;
  retention: boolean;
  sex: {
    code: string;
  };
  type_document: string;
}

export interface PhoneData {
  code: number;
  contactType: {
    code: string;
  };
  contractType: {
    code: string;
  };
  creationDate: string;
  customerServiceLine: {
    code: string;
  };
  messagingType: {
    code: string;
  };
  number: string;
  prefix: {
    code: string;
  };
  principalPhone: boolean;
  type: {
    code: string;
  };
  user: {
    login: string;
  };
  verified: boolean;
}

export interface AddressData {
  active: boolean;
  code: number;
  created_at: string;
  creation_date: string;
  customer_id: number;
  id: number;
  last_update: string;
  preferential_use: boolean;
  type: string;
  updated_at: string;
  username: string;
  valid: boolean;
  verify: boolean;
}

export interface Loan {
  code: number;
  loanNumber: string;
  procedureNumber: {
    number: number;
  };
  operationType: {
    code: string;
  };
  branch: {
    code: number;
  };
  currency: {
    code: number;
  };
  officer: {
    code: number;
  };
  approvedAmount: string;
  status: {
    code: number;
  };
  hasSpecialAdjustment: boolean;
  loanType: {
    code: string;
  };
  basicInsurance: string;
  instaceProcess: number;
}

export interface LoanList {
  loans: Loan[];
  links: {
    self: string;
    navs: Array<{
      href: string;
      rel: string;
      type: string;
    }>;
  };
}

export interface DocumentRequirement {
  code: number;
  documentName?: string;
  exceptional: boolean;
  documentRequirementAdditionalInformation: {
    description: string;
    isMandatory: boolean;
    documentType: string;
    documentReference: string;
  };
}

export interface ProcessInstance {
  active: boolean;
  authentication_response: number;
  biometric_response: number;
  code: number;
  country_birth: string;
  created_at: string;
  current_operations: boolean;
  date_birth: string;
  degree_instruction: string;
  dependants: number;
  dir_back_dni: string;
  dir_customer: string;
  dir_front_dni: string;
  dir_location_verification: string;
  dir_proof_house: string;
  dir_selfie_business: string;
  document_type: string;
  documnet_number: string;
  economic_group: number;
  enrollment_date: string;
  expiration_date: string;
  gender: string;
  id: number;
  is_spouse: boolean;
  last_instance_process_code: number;
  last_update: string;
  lastname: string;
  marital_status: string;
  name: string;
  occupation: string;
  other_lastname: string;
  other_name: string;
  profession: string;
  spouse_number_document: string;
  spouse_type_document: string;
  updated_at: string;
}

export interface DocumentProcess {
  process: {
    code: number;
    processName: string;
    version: number;
  };
  flowActivity: {
    code: number;
    name: string;
  };
  flowActivityInstance: {
    sequence: number;
  };
  step: {
    code: number;
  };
  requirements: DocumentRequirement[];
}

export interface DatabaseResponse {
  country_birth: string;
  date_birth: string;
  document_type: string;
  documnet_number: string;
  gender: string;
  lastname: string;
  marital_status: string;
  name: string;
  number: string;
  other_lastname: string;
  other_name: string;
  resultMessage: string;
  spouse_number_document: string;
  spouse_type_document: string;
  username: string;
}

export interface StackTraceEntry {
  className: string;
  methodName: string;
  fileName: string;
  lineNumber: number;
}

export interface ParsedStackTrace {
  exceptionType: string;
  message: string;
  stackTrace: StackTraceEntry[];
}

export interface AndroidLogEntry {
  metadata: AndroidLogMetadata;
  parsedData:
    | { type: 'auth_token'; data: AuthToken }
    | { type: 'rate_variables'; data: RateVariable[] }
    | { type: 'http_error'; data: HttpError }
    | { type: 'products'; data: Product[] }
    | { type: 'expenses'; data: null }
    | { type: 'customer_fragment'; data: CustomerFragmentInfo }
    | { type: 'age'; data: AgeCalculation }
    | { type: 'sync_status'; data: SyncStatus[] }
    | { type: 'rule_guarantee'; data: RuleGuaranteeInfo[] }
    | { type: 'business_product'; data: BusinessProduct[] }
    | { type: 'response_rules'; data: RuleResult }
    | { type: 'basic_insurance'; data: BasicInsuranceInfo }
    | { type: 'endpoint_call'; data: EndpointCall }
    | { type: 'form_proposal'; data: FormProposalInfo }
    | { type: 'stack_trace'; data: ParsedStackTrace }
    | { type: 'customer_data'; data: CustomerData }
    | { type: 'customer_response'; data: CustomerResponse }
    | { type: 'phone_data'; data: PhoneData }
    | { type: 'address_data'; data: AddressData }
    | { type: 'loans'; data: LoanList }
    | { type: 'document_process'; data: DocumentProcess }
    | { type: 'process_instance'; data: ProcessInstance }
    | { type: 'database_response'; data: DatabaseResponse }
    | { type: 'simple_value'; tag: LogcatTag; value: string | number | boolean }
    | { type: 'raw'; message: string };
}
