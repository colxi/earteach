<?php
// INCLUDED EXTENSIONS 
include_once("extensions/UMS.php");


// AjaxApi Class Definition
class AjaxAPI extends UMS{
   
	/**
	/ Ear Teach Methods -->
	**/
	public function resetStats(){
	
		// connect to DB and search for coincidences
		$DB_Link		= $this->connect();
		
		$login_query 	= "DELETE FROM stats WHERE user_id='{$_SESSION['uID']}'";
		$result 		= mysql_query($login_query,$DB_Link);
		return true;
	}
	
	public function saveTestResults($preset_id,$score){
		/*
		/ Save into DB the results of a trainer rpeset execution, for statistics
		/ Arguments:
		/	$preset_id : ID of the preset in DB table 'presets'
		/	$score : percentage of hits
		*/

		$DB_Link		= $this->connect();
		
		// sanitize input
		if($preset_id == '' || $score == '') return -1;
		$preset_id 	= mysql_real_escape_string($preset_id);
		$score 		= mysql_real_escape_string($score);
			
		// connect to DB and search for coincidences
		$login_query 	= "INSERT INTO stats (user_id,preset_id,score) VALUES('{$_SESSION['uID']}','{$preset_id}','{$score}')";
		$result 		= mysql_query($login_query,$DB_Link);
		
		// done!
		return true;
	}

	public function deletePreset($preset){
	
		// connect to DB and search for coincidences
		$DB_Link		= $this->connect();
		// sanitize input
		$preset 	= mysql_real_escape_string($preset);
		
		// try to delete preset, owned by current user
		$login_query 	= "DELETE FROM presets WHERE id='{$preset}' AND owner = {$_SESSION['uID']}";
		$result 		= mysql_query($login_query,$DB_Link);
		
		// if owner didn't match or preset didn't exist, return error
		if(mysql_affected_rows() == 0) return -1;
		
		// else, remove stats associated to preset
		$login_query 	= "DELETE FROM stats WHERE preset_id='{$preset}'";
		$result 		= mysql_query($login_query,$DB_Link);
		
		return true;
		
	}
	
	public function saveNewPreset($preset){
		
		$DB_Link		= $this->connect();
	
		$name = mysql_real_escape_string($preset->name);
		$items = mysql_real_escape_string(json_encode($preset->items));
		$arpeggiated = ($preset->arpeggiated == 'true') ? 1 : 0;
		$parent = mysql_real_escape_string($preset->parent);
		$list_order = mysql_real_escape_string($preset->list_order);
		$owner = $_SESSION['uID'];
		
		if($name == '' || $arpeggiated == ''|| $parent == '' ) return -1;
		
		$login_query= "INSERT INTO presets (name,items,arpeggiated,parent,list_order,owner) VALUES('{$name}','{$items}','{$arpeggiated}','{$parent}','{$list_order}','{$owner}')";
		$result 	= mysql_query($login_query,$DB_Link);
		
		// if failed inserting new entry in DB return error
		if($result == false) return -1;
		
		// done! return inserted ID;
		return mysql_insert_id();
	}
	
	public function getTrainersStructure($noStats = false){
		/*
		/ 
		*/
		
		
		// get all trainers
		$trainers = $this->getTrainers();
		
		// return -1 if any trainer is available
		if($trainers == -1) return -1;
		
		// iterate over each trainer
		for($i = 0 ; $i < count($trainers); $i++){			
			// get current trainer  presets
			$presets 		= $this->getPresets($trainers[$i]['id'],0);
			$presetsCustom  = $this->getPresets($trainers[$i]['id'],$_SESSION['uID']);
			
			$trainers[$i]['presets'] = $this->getPresetsStructure($presets,$noStats);
			$trainers[$i]['presetsCustom'] = $this->getPresetsStructure($presetsCustom,$noStats);
		
		} 
		
		// done!
		return $trainers;
		
	}
	
	private function getPresetsStructure($presets,$noStats = false){
		
		if($presets != -1){
			// if presets... iterate over each one...
			for($a = 0 ; $a < count($presets); $a++){
				// decode preset ITEMS json stringified array
				$presets[$a]['items'] = json_decode($presets[$a]['items']); 
				// request stats for preset
				$presetStats = $this->getPresetStats($presets[$a]['id']);
				// calculate average score and execution times, and assign them to structure
				if($presetStats == -1 || $noStats == true){
					// if there are no stats for current Preset
					$presets[$a]['completed'] 	= 0;
					$presets[$a]['score'] 		= 0;
				}else{
					// if there are presets, calculate average score and completion tumes
					$totalScore = 0;					
					for($c = 0 ; $c < count($presetStats) ; $c++){
						$totalScore = $totalScore + $presetStats[$c]['score'];
					}
					$presets[$a]['completed'] 	= count($presetStats);
					$presets[$a]['score'] 		= round($totalScore / count($presetStats));
				}
			}
		}else{
			// if no presets, asign empty array
			$presets = Array();
		}
			
		return $presets;
	}
	
	private function getTrainers(){
		/*
		/ Return an array with each trainer id and name
		*/
		$DB_Link= $this->connect();
		
		// Do the query...
		$login_query = "SELECT * FROM trainers";
		$result = mysql_query($login_query,$DB_Link);
		
		// if no results return -1
		if(mysql_num_rows($result) == 0) return -1;
		
		$trainers = array();
		// else pack in array, all results
		while($row = mysql_fetch_assoc($result)) $trainers[] = $row;

		return $trainers;		
	}
	
	private function getPresets($trainer_id,$owner = 0){
		/*
		/ Return an array with the presets of the requestes trainer
		/ Arguments:
		/	$trainer_id : ID of the trainer in DB table 'trainers'
		*/
		$DB_Link= $this->connect();
		
		// sanitize input
		if($trainer_id == '') return -1;
		$trainer_id = mysql_real_escape_string($trainer_id);
		
		// Do the query...
		$login_query = "SELECT * FROM presets WHERE parent = '{$trainer_id}' AND owner = {$owner} ORDER BY list_order ASC";
		$result = mysql_query($login_query,$DB_Link);
		
		// if no results return -1
		if(mysql_num_rows($result) == 0) return -1;
		
		// else pack in array, all results
		while($row = mysql_fetch_assoc($result)) $presets[] = $row;

		// done!
		return $presets;		
	}
	
	/** 
	/ Stats methods
	**/
	public function getPresetStats($preset_id){
		/*
		/ 
		*/

		$DB_Link= $this->connect();
		
		// sanitize input
		if($preset_id == '') return -1;
		$preset_id = mysql_real_escape_string($preset_id);
		
		// Do the query...
		$login_query = "SELECT * FROM stats WHERE user_id = '{$_SESSION['uID']}' AND preset_id = '{$preset_id}' ORDER BY date ASC";
		$result = mysql_query($login_query,$DB_Link);
		
		// if no results return -1
		if(mysql_num_rows($result) == 0) return -1;
		
		// else pack in array, all results
		while($row = mysql_fetch_assoc($result)) $stats[] = $row;
		
		// done!
		return $stats;
	}
	
	public function getActivity($date){
		/*
		/ getActivity() return number of exercises completed in requsted day
		/ if no day is provided, applies current day
		/ Args: $date : expected formating "Y-m-d"  
		/ 		eg: 2013-01-22
		/ FUNCTION ONLY AVAILABLE FOR ADMINS!
		*/
		
		if($_SESSION['is_admin'] == false) return -1;

		$DB_Link= $this->connect();
		
		// sanitize input
		if(!isset($date) || $date == "") $date = date("Y-m-d");		
				
		$date = mysql_real_escape_string($date);
		// Do the query...
		$activity = $activity = "SELECT * FROM stats WHERE date BETWEEN '{$date} 00:00:00' AND '{$date} 23:59:59'";
		//$activity = $activity = "SELECT * FROM stats WHERE date >= CURDATE() AND date < CURDATE() + INTERVAL {$days} DAY";
		$result = mysql_query($activity,$DB_Link);
		
		// done!
		return mysql_num_rows($result);
		
	}
	
}
?>