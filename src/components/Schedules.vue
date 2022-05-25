<template>
  <div class="person-wrapper">
    <el-checkbox-group v-model="showPersonNames">
      <el-checkbox v-for="person in persons" :label="person.name" border />
    </el-checkbox-group>
  </div>

  <el-tag
    v-for="item in showPerson"
    :key="item"
    draggable="true"
    :data-person="item.name"
  >
    {{ item.name }} ( {{ item.left }} )
  </el-tag>

  <el-calendar v-model="value">
    <template #dateCell="{ data }">
      <div class="item-wrapper">
        <div class="date">{{ dateFormat(data) }}</div>
        <div class="item" v-for="time in times">
          <div class="time">{{ time.label }}</div>
          <div
            class="dropzone"
            :data-date="dateFormat(data)"
            :data-time="time.value"
          >
            <template
              v-for="person in result?.[dateFormat(data)]?.[time.value] ?? []"
            >
              <el-tag
                v-if="showPersonNames.includes(person)"
                draggable="true"
                :data-position="dateFormat(data) + '===' + time.value"
                :data-person="person"
                closable
                @close="
                  () => handleTaskRemove(dateFormat(data), time.value, person)
                "
              >
                {{ person }}
              </el-tag>
            </template>
          </div>
        </div>
      </div>
    </template>
  </el-calendar>
  <!-- {{ result }} -->
</template>
<script lang="ts" setup>
import { ref, nextTick, computed } from "vue";
import { ElMessage } from "element-plus";

const times = ref([
  { value: "morning", label: "早" },
  { value: "afternoon", label: "晚" },
  { value: "all", label: "全" },
]);
const newPerson = ref("");
const value = ref(new Date());
const result = ref(JSON.parse(localStorage.getItem("data") ?? "{}"));
const persons = ref(
  localStorage.getItem("persons")
    ? JSON.parse(localStorage.getItem("persons"))
    : [
        {
          name: "许丽珠",
          left: 0,
        },
        {
          name: "危梦云",
          left: 0,
        },
        {
          name: "阙",
          left: 0,
        },
        // {
        //   name: "李四",
        //   left: 0,
        // },
      ]
);
const showPersonNames = ref(persons.value.map((item) => item.name));
const currentNode = ref(null);
const showPerson = computed(() =>
  persons.value.filter((item) => showPersonNames.value.includes(item.name))
);

const dateFormat = (date) => date.day.split("-").slice(1).join("-");

/* 拖动目标元素时触发drag事件 */
document.addEventListener("drag", function (event) {}, false);

document.addEventListener(
  "dragstart",
  function (event) {
    const { person, position } = event.target.dataset;
    // 保存拖动元素的引用(ref.)
    currentNode.value = {
      person: person,
      node: event.target,
    };

    if (position) {
      currentNode.value.position = position;
    }
    // 使其半透明
    event.target.style.opacity = 0.5;
  },
  false
);

document.addEventListener(
  "dragend",
  function (event) {
    // 重置透明度
    event.target.style.opacity = "";
  },
  false
);

/* 放置目标元素时触发事件 */
document.addEventListener(
  "dragover",
  function (event) {
    // 阻止默认动作以启用drop
    event.preventDefault();
  },
  false
);

document.addEventListener(
  "dragenter",
  function (event) {
    // 当可拖动的元素进入可放置的目标时高亮目标节点
    if (event.target.className == "dropzone") {
      event.target.style.background = "#ccc";
    }
  },
  false
);

document.addEventListener(
  "dragleave",
  function (event) {
    // 当拖动元素离开可放置目标节点，重置其背景
    if (event.target.className == "dropzone") {
      event.target.style.background = "";
    }
  },
  false
);

document.addEventListener(
  "drop",
  async function (event) {
    // 阻止默认动作（如打开一些元素的链接）
    event.preventDefault();
    // 将拖动的元素到所选择的放置目标节点中
    if (event.target.className == "dropzone") {
      const { date, time } = event.target.dataset;
      const { person, position = "" } = currentNode.value;
      const [oldDate, oldTime] = position.split("===");

      event.target.style.background = "";

      if (!result.value[date]) {
        result.value[date] = times.value.reduce((all, time) => {
          all[time.value] = [];
          return all;
        }, {});
      }

      await nextTick();

      const isNotExitsInDate = !times.value.some((item) =>
        result.value?.[date]?.[item.value]?.includes(person)
      );

      if (position && oldDate !== date && isNotExitsInDate) {
        // 不同天调动，并且目标那天没有排班
        result.value[oldDate][oldTime] = result.value[oldDate][oldTime].filter(
          (item) => item != person
        );
        result.value[date][time].push(person);
      } else if (position && oldDate === date) {
        // 同一天内调动
        result.value[oldDate][oldTime] = result.value[oldDate][oldTime].filter(
          (item) => item != person
        );

        result.value[date][time].push(person);
      } else if (isNotExitsInDate) {
        // 当天没有排班
        result.value[date][time].push(person);
        const userData = persons.value.find((item) => item.name === person);
        userData.left++;
      } else {
        // 当天已有排班
        ElMessage.error(`【${person}】在【${date}】已有排班`);
      }

      await nextTick();
      saveDate();
    }
  },
  false
);

const handleAddPerson = () => {
  persons.value.push({ name: newPerson.value, left: 0 });
};

const handlePersonRemove = () => {};

const handleTaskRemove = (date, time, name) => {
  const userData = persons.value.find((item) => item.name === name);
  result.value[date][time] = result.value[date][time].filter(
    (item) => item != name
  );
  userData.left--;
};

const saveDate = () => {
  localStorage.setItem("data", JSON.stringify(result.value));
  localStorage.setItem("persons", JSON.stringify(persons.value));
};
</script>

<style>
.input-wrapper {
  width: 400px;
  display: flex;
  margin-bottom: 10px;
}
.person-wrapper {
  margin-bottom: 10px;
}
.date {
  text-align: center;
}

.el-tag {
  margin-left: 10px;
  margin-top: 5px;
}

.item-wrapper {
  height: 140px;
}
.item {
  height: 40px;
  width: 100%;
  display: flex;
}
.el-calendar-table .el-calendar-day {
  height: 160px !important;
}
.time {
  display: inline-block;
  width: 2rem;
}
.dropzone {
  width: 100%;
  height: 100%;
}

[data-person="许丽珠"] {
  color: red !important;
  background: rgba(255, 0, 0, 0.1) !important;
}
[data-person="危梦云"] {
  color: black !important;
  background: rgba(0, 255, 0, 0.1) !important;
}
[data-person="阙"] {
  color: blue !important;
  background: rgba(0, 0, 255, 0.1) !important;
}
[data-person="李四"] {
  color: white !important;
  background: rgba(0, 0, 0, 0.7) !important;
}
</style>
