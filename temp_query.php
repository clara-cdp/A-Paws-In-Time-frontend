<?php
$db = new PDO('sqlite:C:/Users/Clara/Desktop/IT ACADEMY/APIT-API/database/database.sqlite');
$db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
$games = $db->query("SELECT id, room_id, progress FROM games ORDER BY id DESC LIMIT 5")->fetchAll(PDO::FETCH_ASSOC);
print(json_encode($games, JSON_PRETTY_PRINT));
