/* This script will write multiple fake log files */

import file from 'k6/x/file';
import exec from 'k6/execution';
import * as fs from 'k6/experimental/fs' ;

// Old Values

// const TEST_CASES = {
//   'shared_iterations': {
//     executor: 'shared-iterations',
//     iterations: 5000000,
//     maxDuration: '10m',
//     vus: 100,
//   },
//   'constant_request_rate': {
//     executor: 'constant-arrival-rate',
//     rate: 300000,   // 300000
//     timeUnit: '60s',
//     duration: '3m',
//     preAllocatedVUs: 50,
//     maxVUs: 10000,
//   }
// }

// New Values
const TEST_CASES = {
  'shared_iterations': {
    executor: 'shared-iterations',
    iterations: 500,
    maxDuration: '5m',
    vus: 10,
  },
  'constant_request_rate': {
    executor: 'constant-arrival-rate',
    rate: 300000,   // 300000
    timeUnit: '60s',
    duration: '10s',
    preAllocatedVUs: 50,
    maxVUs: 100,
  }
}


export const options = {
  scenarios: { 
    loadtest: TEST_CASES.constant_request_rate,
  },
  insecureSkipTLSVerify: true,
};

// custom configurations
const timestamp_range_seconds = 0      // generated log timestamps should span from now to <now - timestamp_range_seconds> ago
// 3600 = 1h
// 86400 = 1d
// 604800 = 7d
// 1567641600000 = 30d
let entries = 0
let size = 0    // not used
let size_per_entry = 116

const logLevels = ['TRACE', 'DEBUG', 'INFO0', 'WARN0', 'ERROR', 'FATAL'];
const logMessages = [
  "UserLoggedInSuccessfullyFromIPAddress19216801",
  "ErrorOccurredWhileProcessingUserRequestCode00",
  "DatabaseConnectionEstablishedSuccessfully0000",
  "UnauthorizedAccessAttemptBlockedByFirewall000",
  "PasswordChangeRequestedByUserEmailExampleCom0",
  "FileUploadedToServerSuccessfullyUserJohnDoe00",
  "UserSessionTimedOutDueToInactivityOf30Minutes",
  "FailedLoginAttemptDueToInvalidPasswordEntered",
  "NewUserRegistrationCompletedSuccessfully00000",
  "ServerRestartedSuccessfullyAtTimestamp1234567",
  "APIRequestReceivedAndProcessedSuccessfully000",
  "ConfigurationSettingsUpdatedByAdminUser000000",
  "EmailNotificationSentToUserEmailExampleCom000",
  "DataExportToCSVCompletedSuccessfullyFileSaved",
  "NewDeviceRegisteredToUserAccountSuccessfully0",
  "UserProfileUpdatedSuccessfullyAtTimestamp9876",
  "SystemBackupCompletedSuccessfullyAtMidnight00",
  "UserSubscriptionRenewedSuccessfullyFor1Year00",
  "PaymentTransactionProcessedSuccessfullyAmount",
  "UserLoggedOutSuccessfullyFromAllDevices000000"
];
const logComponents = [
  "AuthenticationServiceComponent",
  "DatabaseConnectionManager01234",
  "FirewallSecurityModule01234567",
  "UserProfileManagementSystem012",
  "EmailNotificationService012345",
  "FileUploadHandlerComponent0123",
  "SessionTimeoutManager012345678",
  "APIRequestProcessorComponent01",
  "ConfigurationSettingsUpdater01",
  "PaymentProcessingGateway012345"
];

function generate_log_entry() {
    let observed_ts = Date.now()
    let random_delay_seconds = Math.floor(Math.random() * timestamp_range_seconds)
    let ts = observed_ts - (random_delay_seconds * 1000)
    let logLevel = logLevels[Math.floor(Math.random() * logLevels.length)];
    let logMessage = logMessages[Math.floor(Math.random() * logMessages.length)] + ' ' + logMessages[Math.floor(Math.random() * logMessages.length)] + ' ' + logMessages[Math.floor(Math.random() * logMessages.length)] + ' ' + logMessages[Math.floor(Math.random() * logMessages.length)] + ' ' + logMessages[Math.floor(Math.random() * logMessages.length)] + ' ' + logMessages[Math.floor(Math.random() * logMessages.length)] + ' ' + logMessages[Math.floor(Math.random() * logMessages.length)];
    let logComponent = logComponents[Math.floor(Math.random() * logComponents.length)];
    let id = exec.scenario.iterationInTest.toString().padStart(10, '0')
    let logEntry = ts + ' | ' + logLevel + ' | ' + id + ' | ' + logComponent + ' | ' + logMessage + '\n'

    return logEntry
}

export default function() {
  file.appendString(
    './test-logs-files/log-file-' + exec.vu.idInTest + '.log', 
    generate_log_entry()
  );

}

// export function teardown() {
//   // let entries = exec.instance.iterationsCompleted
//   // console.log('Number of entries generated: ' + entries)
//   // console.log('Log size generated [kB]: ' + (entries * size_per_entry / 1024))
//   // console.log('Log size generated [MB]: ' + (entries * size_per_entry / 1024 / 1024))
// }

export function teardown() {
  let totalSizeBytes = 0;
  totalSizeBytes = file.DirSizeMB('./test-logs-files')
  console.log(totalSizeBytes)
}
