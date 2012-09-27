<?php

function logging($message) {
	global $DEBUG, $class_for_logging;

	//if DEBUG is set to 1 logging messages are displayed, otherwise not
	if (!$DEBUG) {
		$DEBUG = 0;
	}
	
	$log_prefix = $class_for_logging . ": ";
	
	if ($DEBUG == 1) {
		error_log($log_prefix . $message, 0);
	}
}

/**
 * Reads header variable to get userId
 *
 * @return userId
 */
function get_session_user_from_headers() {
	logging("entered get session user from header");
	
	$myheaders = getallheaders();
	$sessionKey = $myheaders["sessionkey"];

	$userId = getUserIdForSessionKey($sessionKey);

	//if (!($userId > 0)) {
		//$userId = "12979"; //for debugging
	//}

	logging("userid from header: " . $userId);

	if ($userId > 0) {
		global $ilUser;
		$ilUser->setId($userId);
		$ilUser->read();
		if(!$ilUser->getLogin()) {
			//TODO remove all data entries for this user id from our own tables
			$userId = 0;
		}
	}
	return $userId;
}

/**
 * @return the user id for the specified session key
 */
function getUserIdForSessionKey($sessionKey) {
	global $ilDB;

	$userId = 0;

	if ($sessionKey) {
		$result = $ilDB->query("SELECT user_id FROM isnlc_auth_info WHERE session_key = " .$ilDB->quote($sessionKey, "text"));
		$userIdArray = $ilDB->fetchAssoc($result);
		$userId = $userIdArray["user_id"];
		
		logging("user id for session key: " . $userId);
	}
	return $userId;
}


/**
 * checks if the question pool is online, contains at least 4 questions and
 * the question have only valid question types
 *
 * @return true if question pool is valid, otherwise false
 */
function isValidQuestionPool($questionpool) {
	//only question pools which contain only questions with the types in this array are loaded
	$VALID_QUESTION_TYPES = array("assMultipleChoice", "assSingleChoice", "assOrderingQuestion", "assNumeric");


	//question pool has to be online
	if($questionpool->getOnline()) {
		$questionList = $questionpool->getQuestionList();

		//question pool has to contain at least 4 questions
		if (count($questionList) >= 4) {
			$onlyValidTypes = true;
			foreach ($questionList as $question) {
				$type = $question["type_tag"];

				//check if the type of the question is a valid type
				if (!in_array($type, $VALID_QUESTION_TYPES)) {
					$onlyValidTypes = false;
				}
			}
			$validQuestionPool = $onlyValidTypes;
		}
	}

	return $validQuestionPool;
}

/**
 * reads statistics data from the header
 */
function get_uuid_from_headers() {
	logging("in get uuid from headers");

	$myheaders = getallheaders();
	$uuid = $myheaders["uuid"];

	logging("uuid from header: " . $uuid);

	return $uuid;
}


?>